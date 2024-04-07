"""Aplicando ahora video"""

import cv2 as cv

cap = cv.VideoCapture(0) # El indice 0 significa que va tratar de buscar el primer dispositivo de captura, más valores va buscar otras cámaras
while (True):
    res, img = cap.read()
    img2 = cv.cvtColor(img, cv.COLOR_BGR2RGB) 
    img3 = cv.cvtColor(img2, cv.COLOR_BGR2HSV) 

    vb = (110, 60, 60)
    va = (130, 255, 255)
    mask = cv.inRange(img3, vb, va)
    res = cv.bitwise_and(img, img, mask=mask)
    cv.imshow('captura', res)
    if cv.waitKey(1) &0xFF == ord('s'):
        break

cap.release() # Es función sirve para liberar el buffer del video
cv.destroyAllWindows()
