export function mergeClassName(
	...classes: (string | false | undefined | null)[]
) {
	return classes.filter(Boolean).join(" ");
}
