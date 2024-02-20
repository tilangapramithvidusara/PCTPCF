export default function never(x: never): never {
  throw new Error("Didn't expect to get here");
}
