import SwiftUI
import CoreImage
import CoreImage.CIFilterBuiltins

struct StyledQRGenerator {
    /// Generate a standard visible QR code (for expanded view / scanning)
    static func generate(
        from string: String,
        size: CGFloat = 200,
        foregroundColor: UIColor = .white,
        backgroundColor: UIColor = UIColor(red: 0.1, green: 0.1, blue: 0.1, alpha: 1),
        logoImage: UIImage? = nil
    ) -> UIImage? {
        let context = CIContext()

        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "H"

        guard let ciImage = filter.outputImage else { return nil }

        let colorFilter = CIFilter.falseColor()
        colorFilter.inputImage = ciImage
        colorFilter.color0 = CIColor(color: backgroundColor)
        colorFilter.color1 = CIColor(color: foregroundColor)

        guard let coloredImage = colorFilter.outputImage else { return nil }

        let scale = size / coloredImage.extent.width
        let scaledImage = coloredImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else { return nil }

        var qrImage = UIImage(cgImage: cgImage)

        if let logo = logoImage {
            qrImage = overlayLogo(qrImage: qrImage, logo: logo, size: size)
        }

        return qrImage
    }

    /// Generate an embossed QR code that blends into the card background.
    /// Uses very low contrast - foreground is only slightly lighter/darker than background.
    /// Still scannable by cameras up close but nearly invisible to the naked eye.
    static func generateEmbossed(
        from string: String,
        size: CGFloat = 200,
        baseColor: UIColor,
        brightnessOffset: CGFloat = 0.04
    ) -> UIImage? {
        var hue: CGFloat = 0, saturation: CGFloat = 0, brightness: CGFloat = 0, alpha: CGFloat = 0
        baseColor.getHue(&hue, saturation: &saturation, brightness: &brightness, alpha: &alpha)

        // QR foreground: slightly lighter than background
        let fgBrightness = min(1.0, brightness + brightnessOffset)
        let foreground = UIColor(hue: hue, saturation: saturation, brightness: fgBrightness, alpha: 1.0)

        return generate(
            from: string,
            size: size,
            foregroundColor: foreground,
            backgroundColor: baseColor
        )
    }

    private static func overlayLogo(qrImage: UIImage, logo: UIImage, size: CGFloat) -> UIImage {
        let logoSize = size * 0.22
        let renderer = UIGraphicsImageRenderer(size: qrImage.size)

        return renderer.image { ctx in
            qrImage.draw(at: .zero)

            let logoRect = CGRect(
                x: (qrImage.size.width - logoSize) / 2,
                y: (qrImage.size.height - logoSize) / 2,
                width: logoSize,
                height: logoSize
            )

            let padding: CGFloat = 3
            let bgRect = logoRect.insetBy(dx: -padding, dy: -padding)
            UIColor.white.setFill()
            UIBezierPath(roundedRect: bgRect, cornerRadius: bgRect.width * 0.2).fill()

            let clipPath = UIBezierPath(roundedRect: logoRect, cornerRadius: logoRect.width * 0.15)
            ctx.cgContext.saveGState()
            clipPath.addClip()
            logo.draw(in: logoRect)
            ctx.cgContext.restoreGState()
        }
    }
}
