export default function UiTestPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>UI Test Page - 수정 버튼 테스트</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: 12, padding: 16, marginTop: 16 }}>
        <p>내역 카드 샘플</p>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
          <button
            style={{ width: "100%", height: 32, borderRadius: 8, background: "#fff1f3", color: "#ff385c", fontWeight: 600, fontSize: 13, border: "none" }}
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
}
