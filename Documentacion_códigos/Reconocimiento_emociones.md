# Recocimiento de emociones usando el clasificador HAARCASCADADE FRONTAL

## Contenido

1. [Objetivo](#objetivo)
2. [Teoría](#recursos)
3. [Recursos](#teoría)
4. [Proceso](#proceso)
5. [Resultados](#desarrollo)
    - [Generación de data set](#generación-del-data-set)
    - [Entramiento del modelo](#entrenamiento-del-modelo)
6. [Referencias](#resultados)

## Objetivo

Desarrollar un sistema capaz de reconocer las emociones de feliz, asombrado y enojado

## Teoría 

Para este proyecto se manejaron utilizando diferentes librerias de python principalmente la libreia de OpenCV para el manejo de imágenes por computadora.

Los clasificadores de cascade basados en carácteristicas de Haar es un método eficaz de detección de objetos propuestos por Viola y Jones en 2001, aunque inicialmente se desarrollaron para detectar rostros, también se pueden adaptar para detectar otro tipo de objetos, como ojos, sonrisas, choches, entre otros [[1]](#enlace-1).

Características de Haar: Son patrones visuales simples que se pueden calcular rápidamente en una imagen. Estas características se asemejan a pequeñas versiones de núcleos de wavelet de Haar y son utilizadas para capturar la presencia de bordes, cambios de textura, y otras propiedades visuales. [[2]](#enlace-2).

El reconocimiento se realizó calculando la distancia euclidiana entre los vectores de características de una sonda y la imagen de referencia. Tal método es un cambio robusto contra el cambio de iluminación por su naturaleza, pero tiene un inconveniente: el registro exacto de los puntos marcadores es complicado[[3](#enlace-3)].

### Tipo de clasificadores 

#### Eigenfaces

Este método fue propuesto por Karl Person y Harold Hotelling para convertir un para convertir el conjunto de posibles variables correlacionadas en un conjunto más pequeño de las variables no correlacionadas. La idea es que un conjunto de datos de alta dimensión se describe a menudo por variables correlacionadas y por lo tanto algunas dimensiones significativas explican la mayor parte de la información. El método PCA encuentra las direcciones con la mayor varianza en los datos, llamados componentes principales.

Los erígenos capturan las variaciones en la apariencia facial en el conjunto de datos, como la forma de los ojos, la nariz, la boca, etc. Estas variaciones están codificadas en las Eigenfaces ya que representan la varianza máxima en el conjunto de datos.

Además de los rasgos faciales, Eigenfaces también capturan variaciones en las condiciones de iluminación presentes en la imagen. Esto se debe a que las variaciones de iluminación a menudo contribuyen significativamente a la varianza observada en las imágenes faciales.

#### Fisherfaces

A este método a diferencia del método Eigenfaces, que encuentra una combinación lineal de características que maximiza la varianza total en los datos. Este considera la información en clases y evita que la información mucha información discriminatoria se pierda.

El Análisis Clero Discriminante realiza una reducción de dimensionalidad específica de la clase y fue inventado por el gran estadístico Sir R.A Fisher. Con el fin de encontrar la combinación de las características que separa mejor entre las clases, el Análisis Discriminante Lineal maximice la relación entre clases y dispersión dentro de las clases, en lugar de maximizar la dispersión general.


#### Local Binary Patterns Histograms (LBPH)

Eigenfaces y Fisherfaces adoptan un enfoque algo holístico para enfrentar el reconocimiento. El enfoque de Eigenfaces maximiza el scatter total, lo que puede conducir a problemas si la varianza es generada por una fuente externa; así que para preservar alguna información discriminativa aplicamos un análisis discriminatorio lineal y optimizado como se describe en el método Fisherfaces.  Sin embargo, este método tiene la particularidad de solo trabajar bien en escenarios restringidos y no siempre en la vida puede haber una configuración de luz perfecta.

LBPH, se enfoca en extraer la carácterísticas locales de las imágenes y diferencia de obtener ver las imágenes completas de como un vector de alta dimesión, este solo describe sólo las carácteristicas de un objeto a lo que lleva a una baja dimesión implícita.

Este método utiliza la metodología de los patrones binarios locales, que consiste en el análisis de de textura de imágenes 2D, este método llevó a esto a una al procesamiento de imágenes enfocadas en caracterizar la disposición espacial de intensidades de pixeles en una imágen.

Esta fue propuesta por Ahonen que fue en dividir la imagen de la LBP en m regiones locales y extraer un histograma de cada una. El vector de característica espacialmente mejorado se obtiene entonces concatenando los histogramas locales (no fusionándolos).

## Recursos

- [Archivo HaarcascadeFrontal](../reconocedor_rostros/haarcascade_frontalface_alt.xml)
- [Dataset](https://www.dropbox.com/scl/fo/d42raxiwhec5p4a37sz7k/AGqdaCkvg_wU6ElDnnbrtFA?rlkey=mx47r91p8w56l8p582rmdg95h&st=5zjb7tuc&dl=0)

## Proceso

Las etapas para este proyectos fue fueron:
- La descarga del haarcascade_frontalface del repositorio oficial.
- Generación del código para generar la imágenes positivas y negativas de un mínimo de 5 personas
- Capturar un mínimo de 600 imágenes positivas de cada emoción y persona
- Capturar un mínimo de 1000 imágenes negativas de cada persona
- Cargar las imágenes y entrenar el modelo
- Probar el model terminado


## Desarrollo


### Generación del data set

Para este proyecto primeramente se tuvo que generar el dataset de las imágenes positivas y negativas

Para realizar la capturas se manejó el siguiente código

Se cargan las librerias y se define la ubicación en donde se van a almecenar las imágenes

``` python
import cv2 as cv
import os

# Verificar si la carpeta de destino existe, si no, crearla
output_dir = './capturas/johann/triste/'
if not os.path.exists(output_dir):
    print('No existe el directorio')
    
```

Se define el haarcascade para poder identificar el rostro de la persona y si inicializa el capturador de imágen

``` python
# Cargar el clasificador de Haar para la detección de rostros
rostro = cv.CascadeClassifier('haarcascade_frontalface_alt.xml')

# Iniciar la captura de vídeo desde la cámara
cap = cv.VideoCapture(0)

``` 

Se crea un ciclo para poder generar diferentes capturas y al mismo tiempo se van redimensionando a un tamaño de 100x100 px y se crea un frame para poder visualizar el video de la persona.

``` python

# Contador para el nombre de los archivos de salida
i = 333

while True:
    # Capturar un fotograma de la cámara
    ret, frame = cap.read()

    # Convertir el fotograma a escala de grises
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    
    # Detectar rostros en la imagen en escala de grises
    rostros = rostro.detectMultiScale(gray, 1.3, 5)
    
    # Iterar sobre cada rostro detectado
    for(x, y, w, h) in rostros:
        # Dibujar un rectángulo alrededor del rostro detectado en el fotograma original
        
        # Dibujar un rectángulo alrededor del rostro detectado en el fotograma original
        frame = cv.rectangle(frame, (x-20, y-20), (x+w+20, y+h+20), (0, 255, 0), 2)

        # frame = cv.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # Recortar el área del rostro detectado
        frame2 = frame[y:y+h, x:x+w]
        
        # Redimensionar el área del rostro a 100x100 píxeles
        frame2 = cv.resize(frame2, (100, 100), interpolation=cv.INTER_AREA)
        
        # Guardar el rostro redimensionado como una imagen PNG
        cv.imwrite(output_dir+'johanntriste'+str(i)+'.png', frame2)
        
    # Mostrar el fotograma con los rostros detectados
    cv.imshow('Rostros', frame)
    
    # Incrementar el contador de archivos de salida
    i += 1
    
    # Esperar por la tecla ESC para salir del bucle
    k = cv.waitKey(1)
    if k == 27:
        break

# Liberar los recursos de la cámara y cerrar las ventanas
cap.release()
cv.destroyAllWindows()

``` 

Para el manejo de este código se realizaron un total de 600 - 800 imágenes positivas de cada emoción: Feliz, Asombrado, Enojado. Y entre 1200 -2000 imágenes negativas. Las imágenes negativas son necesarias para evitar que siempre identifique a la persona con una emoción.

### Entrenamiento del modelo

Para poder generar el archivor clasificador y entrenar el modelo se se generó con el modelo


Se crea un arreglo de las nombres de las carpetas, despues en la iteración se crea un ciclo que guardará los datos en una matriz que contré las etiquetas asociadas con su categoria

``` python

import cv2 as cv 
import numpy as np 
import os

dataSet = './capturas'
emotions = ['feliz', 'enojado', 'asombrado']
faces  = os.listdir(dataSet)

labels = []
facesData = []
label = 0 


# Iterar sobre cada emoción
for emotion in emotions:
    emotionPath = os.path.join(dataSet, emotion)
    if not os.path.isdir(emotionPath):
        continue  # Si el directorio de la emoción no existe, saltar

    # Iterar sobre cada persona dentro de la emoción
    for person in os.listdir(emotionPath):
        personPath = os.path.join(emotionPath, person)
        if not os.path.isdir(personPath):
            continue  # Si no es un directorio, saltar

        # Iterar sobre cada imagen de la persona
        for faceName in os.listdir(personPath):
            facePath = os.path.join(personPath, faceName)
            if os.path.isfile(facePath):
                labels.append(label)
                facesData.append(cv.imread(facePath, 0))
        label += 1

print(f"Total de imágenes de la emoción 'triste': {np.count_nonzero(np.array(labels) == 0)}")
print(f"Total de imágenes de la emoción 'feliz': {np.count_nonzero(np.array(labels) == 1)}")
print(f"Total de imágenes de la emoción 'enojado': {np.count_nonzero(np.array(labels) == 2)}")
print(f"Total de imágenes de la emoción 'asombrado': {np.count_nonzero(np.array(labels) == 3)}")
print(f"Total de imágenes de la emoción 'neutro': {np.count_nonzero(np.array(labels) == 4)}")


``` 

En una vez creada lista facesData, se pasa esa lista al modelo para comenzar a entrenarlo

``` python

# Entrenar el reconocedor de caras
faceRecognizer = cv.face.LBPHFaceRecognizer_create()
faceRecognizer.train(facesData, np.array(labels))
faceRecognizer.write('EmocionesmodeloLBPHFace.xml')
``` 

## Resultados

Una vez entrenado el modelo con el clasificador LBPHF, procederemos a cargar el archivo generado con el siguiente código


``` python

import cv2 as cv
import os

# Verify that the Haar cascade file exists
cascade_path = 'haarcascade_frontalface_alt.xml'
if not os.path.isfile(cascade_path):
    raise FileNotFoundError(f"The Haar cascade file '{cascade_path}' was not found. Please check the path.")

# Initialize face recognizer
faceRecognizer = cv.face.LBPHFaceRecognizer_create()

# Read the trained model
model_path = "EmocionesmodeloLBPHFace.xml"

if not os.path.isfile(model_path):
    raise FileNotFoundError(f"The model file '{model_path}' was not found. Please check the path.")
faceRecognizer.read(model_path)

# Define emotion labels
faces = ["enojo", "feliz", "asombrado"]

# Initialize video capture
cap = cv.VideoCapture(0)
if not cap.isOpened():
    raise Exception("Could not open video device")

# Load the Haar cascade for face detection
rostro = cv.CascadeClassifier(cascade_path)
if rostro.empty():
    raise Exception("Failed to load Haar cascade file")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame")
        break
    
    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cpGray = gray.copy()
    rostros = rostro.detectMultiScale(gray, 1.3, 3)
    
    for (x, y, w, h) in rostros:
        frame2 = cpGray[y:y+h, x:x+w]
        frame2 = cv.resize(frame2, (100, 100), interpolation=cv.INTER_CUBIC)
        result = faceRecognizer.predict(frame2)
        cv.putText(frame, f'{result}', (x, y-5), 1, 1.3, (255,255,0), 1, cv.LINE_AA)
        
        # Display the prediction result
        if result[1] < 100:
            cv.putText(frame, f'{faces[result[0]]}', (x, y-25), 2, 1.1, (0, 255, 0), 1, cv.LINE_AA)
            cv.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        else:
            cv.putText(frame, 'Desconocido', (x, y-20), 2, 0.8, (0, 0, 255), 1, cv.LINE_AA)
            cv.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
    
    cv.imshow('frame', frame)
    if cv.waitKey(1) == 27:  # Press 'ESC' to exit
        break
cap.release()
cv.destroyAllWindows()

```

Obtiendo asi los siguientes resultados




## Referencias

### Enlace 1:
https://docs.opencv.org/3.4/db/d28/tutorial_cascade_classifier.html
### Enlace 2:
https://github.com/eAlcaraz85/vpcurso?tab=readme-ov-file#haarcascades
### Enlace 3:
https://medium.com/@seymurqribov05/face-recognition-eigenfaces-fisherfaces-lbph-0b39d41bd54c


