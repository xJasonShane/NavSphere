import { NextResponse } from 'next/server'

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function successResponse(data: Record<string, unknown>) {
  return NextResponse.json(data)
}
