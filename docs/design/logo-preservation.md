# Preserved logo

The source is the existing `assets/images/blog-icon.png`, a transparent 464 by 149 pixel asset.
The new `assets/images/ajat-prabha-logo.svg` preserves its original outlined monogram, wordmark letter contours, spacing, and canvas proportions.
The wordmark is traced geometry, not replacement text or a substitute font.
The companion `assets/images/ajat-prabha-mark.svg` contains the same monogram with a cropped 104 by 96 viewBox.
Neither file embeds a raster, loads another resource, or runs a script.
The original PNG and favicon remain untouched.

## Rendering contract

Import the full SVG inline to inherit the surrounding `color` through the wordmark's `currentColor` fill.
Use accessible text on the containing home link and mark the inline SVG decorative to avoid duplicate labels.
The monogram defaults to the source's pale aqua colors, `#dcefef` at 65% opacity for its outline and opaque `#e9f5f5` for its inner strokes.
Set `--logo-mark-outline` and `--logo-mark-fill` to a darker brand color on light surfaces.
The source's white wordmark is visible by inheriting white on a dark or photograph background.
An external image element cannot inherit these colors from its document.
The full SVG retains the original transparent canvas padding, so its intrinsic height includes breathing room above and below the mark.

## Trace provenance and verification

The paths were generated from the source's alpha channel with Pillow 12.3.0, NumPy 2.5.4, and potracer 0.0.4 in an isolated temporary environment.
The monogram was isolated left of x=105 and traced at alpha thresholds 80 for the outer silhouette and 220 for the opaque inner strokes.
The wordmark was isolated from x=105 onward and traced at alpha threshold 128.
Potrace used `turdsize=1`, `alphamax=0.8`, `opttolerance=0.1`, and its default curve optimization.
Coordinates were serialized to two decimal places.
This smooth vector reconstruction follows the raster contours; it is not a claim of pixel-perfect reproduction of raster antialiasing.

Both assets passed XML shape-only inspection and contain only SVG, group, and path elements.
The full logo was rasterized at widths 464 and 210 on both light and dark surfaces and visually compared to the original.
The comparison artifact for this session is `/tmp/ajat-logo-vector-comparison.png`.
The resulting wordmark and monogram preserve the original recognizable shape at header sizes.
