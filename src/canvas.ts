export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement): boolean => {
	// Lookup the size the browser is displaying the canvas in CSS pixels
	const displayWidth = canvas.clientWidth;
	const displayHeight = canvas.clientHeight;

	// Check if the canvas is not the same size
	const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;
 
	if (needResize) {
		canvas.width = displayWidth;
		canvas.height = displayHeight;
	}

	return needResize;
}
