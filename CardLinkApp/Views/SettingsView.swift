import SwiftUI

struct SettingsView: View {
    @Bindable var store: ProfileStore
    @Environment(\.dismiss) private var dismiss
    @State private var urlInput: String = ""
    @State private var syncing = false

    var body: some View {
        NavigationStack {
            Form {
                Section("プロフィールURL") {
                    TextField("https://cardlink.vercel.app/profile", text: $urlInput)
                        .textContentType(.URL)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)

                    Button {
                        store.updateProfileURL(urlInput)
                    } label: {
                        Text("URLを保存")
                    }
                    .disabled(urlInput.isEmpty)
                }

                Section("データ同期") {
                    Button {
                        syncing = true
                        Task {
                            await store.fetchFromWeb()
                            syncing = false
                        }
                    } label: {
                        HStack {
                            Text("Webからデータを取得")
                            Spacer()
                            if syncing {
                                ProgressView()
                            }
                        }
                    }
                    .disabled(syncing)
                }

                Section("プロフィール情報") {
                    LabeledContent("名前", value: store.profile.name)
                    LabeledContent("肩書き", value: store.profile.title)
                    LabeledContent("リンク数", value: "\(store.profile.socialLinks.count)")
                }
            }
            .navigationTitle("設定")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完了") { dismiss() }
                }
            }
            .onAppear {
                urlInput = store.profile.profileURL
            }
        }
    }
}
