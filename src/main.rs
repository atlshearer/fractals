#![allow(unused_imports)]
mod mandelbrot;

use image;
use num_complex;

use futures::{TryFutureExt as _, TryStreamExt};
use hyper::header::{HeaderName, HeaderValue};
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server};
use hyper::{Method, StatusCode};
use std::convert::Infallible;
use std::io::Cursor;
use std::net::SocketAddr;

// fn main() {
//     let image_buffer = mandelbrot::mandelbrot(-0.59, 0.615, 0.02);
//     // let image_buffer = mandelbrot(0.0, 0.0, 2.0);
//     // let image_buffer = mandelbrot(0.3, 0.0, 0.1);

//     // Save the image as “fractal.png”, the format is deduced from the path
//     image_buffer.save("fractal.png").unwrap();
// }

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

    let make_svc = make_service_fn(|_conn| async { Ok::<_, Infallible>(service_fn(hello_world)) });

    let server = Server::bind(&addr).serve(make_svc);

    println!("Listening on http://{}", addr);

    if let Err(e) = server.await {
        eprintln!("server error: {}", e);
    }
}

async fn hello_world(req: Request<Body>) -> Result<Response<Body>, Infallible> {
    let mut response = Response::new(Body::empty());

    match (req.method(), req.uri().path()) {
        (&Method::GET, "/") => {
            *response.body_mut() = Body::from("Try POSTing data to /echo");
        }
        (&Method::POST, "/echo") => {
            *response.body_mut() = req.into_body();
        }
        (&Method::POST, "/echo/uppercase") => {
            let mapping = req.into_body().map_ok(|chunk| {
                chunk
                    .iter()
                    .map(|byte| byte.to_ascii_uppercase())
                    .collect::<Vec<u8>>()
            });

            *response.body_mut() = Body::wrap_stream(mapping);
        }
        (&Method::GET, "/mandelbrot.png") => {
            let bytes: Vec<u8> = mandelbrot::mandelbrot_bytes(-0.59, 0.615, 0.02);

            *response.body_mut() = Body::from(bytes);
            response
                .headers_mut()
                .insert("content-type", HeaderValue::from_str("image/png").unwrap());
        }
        (&Method::POST, "/echo/reverse") => {
            let full_body = hyper::body::to_bytes(req.into_body())
                .await
                .expect("Error converting body to bytes");

            let reversed_body = full_body.iter().rev().cloned().collect::<Vec<u8>>();

            *response.body_mut() = reversed_body.into();
        }
        _ => {
            *response.status_mut() = StatusCode::NOT_FOUND;
        }
    }

    Ok(response)
}
