import cv2 as cv
import numpy as np 

img = cv.imread('img-wally.png')
h,w = img.shape[:2]

mw = cv.getRotationMatrix2D((h//2, w//2),30,-1)
img2 = cv.warpAffine(img,mw,(h,w))

cv.imshow('imagen1', img)
cv.imshow('imagen2', img2)
cv.waitKey(0)
cv.destroyAllWindows()