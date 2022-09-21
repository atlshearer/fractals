mod mandelbrot;
#[macro_use]
extern crate rocket;

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
    rocket::build().mount("/", routes![index])
}
