import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { businessNumber } = await req.json();

    if (!businessNumber) {
      return NextResponse.json({ error: "사업자등록번호가 필요합니다." }, { status: 400 });
    }

    // 숫자만 추출
    const cleanNumber = businessNumber.replace(/[^0-9]/g, "");

    const serviceKey = process.env.DATA_GO_KR_API_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: "서버에 API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    // 국세청 상태조회 API URL
    // 참고: 발급받은 API 키가 인코딩된 상태면 그대로 사용, 디코딩된 상태면 encodeURIComponent 필요할 수 있음
    // 일단 그대로 querystring으로 넘김.
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}&returnType=JSON`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        b_no: [cleanNumber]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "공공데이터포털 API 호출에 실패했습니다.", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Business number verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
