# image-scaling-exercise

My attempt to downscale an image by 50% using box filtering.

First step is to read in the image (which is a png). This is covered in `readInScanline.js` which is not actually a part of this exercise (I covered that in a separate exercise).

Once we have the scanline, we can start building "the boxes". A box is a 2x2 grid of pixels.

Using each 2x2 grid, we will take the average of the grid and use that to replace all four pixels.

Given the above, an 8px by 8px png reduced to a 4px by 4px would actually have 1/4 the pixels (so I'm not actually sure this would be right, but it's an experiment, so let's find out).