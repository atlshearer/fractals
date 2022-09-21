use std::io::Cursor;

pub fn mandelbrot_bytes(x: f32, y: f32, scale: f32) -> Vec<u8> {
    let image_buffer = mandelbrot(x, y, scale);
    let mut bytes: Vec<u8> = Vec::new();

    image_buffer
        .write_to(&mut Cursor::new(&mut bytes), image::ImageOutputFormat::Png)
        .unwrap();

    bytes
}

fn mandelbrot(x: f32, y: f32, scale: f32) -> image::ImageBuffer<image::Rgb<u8>, Vec<u8>> {
    let image_width = 500;
    let image_height = 500;

    let scale_x = 2.0 / image_width as f32;
    let scale_y = 2.0 / image_height as f32;

    let mut image_buffer = image::ImageBuffer::new(image_width, image_height);

    // Iterate over the coordinates and pixels of the image
    for (pixel_x, pixel_y, pixel) in image_buffer.enumerate_pixels_mut() {
        let pixel_scaled_x = pixel_x as f32 * scale_x - 1.0;
        let pixel_scaled_y = pixel_y as f32 * scale_y - 1.0;

        let actual_x = x + pixel_scaled_x * scale;
        let actual_y = y - pixel_scaled_y * scale;

        let c = num_complex::Complex::new(actual_x, actual_y);
        let mut z = num_complex::Complex::new(0.0, 0.0);

        let mut i = 0;
        while i < 255 && z.norm() <= 2.0 {
            z = z * z + c;
            i += 1;
        }

        *pixel = image::Rgb([i as u8, i as u8, i as u8]);
    }

    image_buffer
}
