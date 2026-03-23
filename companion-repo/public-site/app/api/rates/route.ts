// TODO: Exercise 2d — Rates API Route | Target: public-site/app/api/rates/route.ts
import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ rates: [] }); }
