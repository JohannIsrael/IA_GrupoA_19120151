import cv2 as cv

img = cv.imread('img/5fa7246cc6c06.jpeg', 1)
img2 = cv.cvtColor(cv.COLOR_BGR2HSV)
vb = (0, 60, 60)
va = (10, 255, 255)
vb1 = (170, 60, 60)
va1 = (180, 255, 255)

"""El rango del color rojo es de 0 - 10 ó 170 - 180 """

"""La función mask extrae todos los pixeles en base el rango de color que se le pase"""
mask = cv.inRange(img2, vb, va) 
mask1 = cv.inRange(img2, vb1, va1)
mask2 = mask+ mask1
res = cv.bitwise_and(img, img, mask=mask2)
cv.imshow('mask', mask2) #muestra solo la segmentacion del color (en este caso solo el color rojo)
cv.imshow('img1', img) 
cv.imshow('img2', img2)
cv.imshow('res', res)   
cv.waitKey(0)
cv.destroyAllWindows()

