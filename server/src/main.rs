mod mandelbrot;
#[macro_use]
extern crate rocket;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

#[derive(Responder)]
#[response(content_type = "image/png")]
struct MyResponder {
    inner: Vec<u8>,
}

#[get("/mandelbrot?<x>&<y>&<scale>")]
fn index(x: f32, y: f32, scale: f32) -> MyResponder {
    MyResponder {
        inner: mandelbrot::mandelbrot_png_bytes(x, y, scale),
    }
}

#[launch]
fn rocket() -> _ {
    rocket::build().attach(CORS).mount("/", routes![index])
}
