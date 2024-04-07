import cv2 as cv
import numpy as np

img = cv.imread('img/5fa7246cc6c06.jpeg', 0) 
"""# 1 son 3 canales, 0 es un canal"""
w,h= img.shape
img2 = np.zeros((w*2,h*2), dtype='uint8')
cv.imshow('macro1', img2)
#print(w, h)

for i in range(w):
    for j in range(h):
        #img[i,j]=255-img[i,j] esto es para obtener el negativo de la imagen
        # if (img[i, j]>150): #esta funcion es para ponerlo en blanco y negro
        #     img[i,j]=255
        # else:
        #     img[i,j]=0

        # La fución warpAffine permite hacer la rotación de una imagen sin tener que hacer las operaciones en crudo

        """
        Interpolacion

        def escala(imx, escala):
        
            width = int(imx.shape[1]*escala/100)
            height = int(imx.shape[0]*escala/100)
            size = (width, height)
            im = cv.resize(imx, size, interpolation = cv.INTER_AREA)
            return im

        img = cv.imread('tr.png', 0)
        img2 = escala(img, 200)
        cv.imshow('original',img)
        cv.imshow('escalada', img2)
        cv.waitKey(0)
        cv.destroyAllWindows()

        """

        img2[i+20,j+20] = img[i, j]  #Esta funcion escala la imagen
cv.imshow('marco', img)
cv.waitKey(0)
cv.destroyAllWindows()