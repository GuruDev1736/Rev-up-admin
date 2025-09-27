import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const upstream = await fetch("https://api.revupbikes.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    if (!upstream.ok || data.STS !== 200) {
      return NextResponse.json(
        { ok: false, message: data.MSG || "Login failed" },
        { status: upstream.status || 400 }
      );
    }
    const token = data.CONTENT?.token;
    // create response and set cookie
    const res = NextResponse.json({
      ok: true,
      user: {
        userName: data.CONTENT.userName,
        userId: data.CONTENT.userId,
        fullName: data.CONTENT.fullName,
        userRole: data.CONTENT.userRole,
      },
    });

    // set HttpOnly cookie (1 week)
    res.cookies.set({
      name: "revup_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login proxy error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}