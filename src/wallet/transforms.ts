import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';

/**
 * class-transformer `@Transform` helper that converts an incoming value to a
 * `bigint`.
 *
 * Using a bare `BigInt(value)` inside `@Transform` means a missing or
 * non-integer value (e.g. `"abc"`, `2.5`, `""`) makes `BigInt()` throw a raw
 * `SyntaxError`/`RangeError` during request transformation, which surfaces to
 * the client as a 500. This wrapper rejects bad input with a 400 instead, so
 * malformed `assetId`/`decimals` get correct error semantics.
 */
export function toBigIntOrThrow({ value, key }: TransformFnParams): bigint {
  if (value === undefined || value === null || value === '') {
    throw new BadRequestException(`${key} is required and must be an integer`);
  }
  try {
    return BigInt(value);
  } catch {
    throw new BadRequestException(`${key} must be an integer`);
  }
}
