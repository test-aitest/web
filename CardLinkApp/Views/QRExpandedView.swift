import SwiftUI

struct QRExpandedView: View {
    let profile: CardProfile
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let styles = profile.styles
        let bgColor = Color(hex: styles.bgColor)
        let textColor = Color(hex: styles.textColor)

        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 24) {
                // Header label
                Text("カメラでスキャン")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(textColor.opacity(0.5))
                    .padding(.top, 60)

                Spacer()

                // QR code - properly sized and centered
                if let qrImage = StyledQRGenerator.generate(
                    from: profile.profileURL,
                    size: 200,
                    foregroundColor: .white,
                    backgroundColor: UIColor(bgColor)
                ) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200, height: 200)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // URL
                Text(profile.profileURL)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(textColor.opacity(0.2))

                Spacer()

                // Close button
                Button {
                    dismiss()
                } label: {
                    Text("閉じる")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(textColor.opacity(0.4))
                        .padding(.horizontal, 32)
                        .padding(.vertical, 10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(textColor.opacity(0.1), lineWidth: 0.5)
                        )
                }
                .padding(.bottom, 40)
            }
        }
    }
}
