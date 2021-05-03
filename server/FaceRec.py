import face_recognition
import cv2
import numpy as np
import sys

# Per concatenare le due immagini, devono avere la stessa altezza, quindi ne cambiamo la forma
def hconcat_resize_min(im_list, interpolation=cv2.INTER_CUBIC):
    h_min = min(im.shape[0] for im in im_list)
    im_list_resize = [cv2.resize(im, (int(im.shape[1] * h_min / im.shape[0]), h_min), interpolation=interpolation)
                      for im in im_list]
    return cv2.hconcat(im_list_resize)

first_path = sys.argv[1]
second_path = sys.argv[2]
final_path = sys.argv[3]

# Carica l'immagine
first_image = face_recognition.load_image_file(first_path)

# Effettua l'encoding dell'immagine, [0] indica che se sono presenti più volti, verrà preso solo il primo trovato
first_encoding = face_recognition.face_encodings(first_image)[0]

# Il metodo face_distance necessita una lista
known_encodings = [
    first_encoding
]

# Carica ed esegue l'encoding del volto presente nella seconda immagine
image_to_test = face_recognition.load_image_file(second_path)
image_to_test_encoding = face_recognition.face_encodings(image_to_test)[0]

# Calcola la "distanza" tra i due volti
face_distances = face_recognition.face_distance(known_encodings, image_to_test_encoding)

for i, face_distance in enumerate(face_distances):
    distance = str(round((1-face_distance)*100 , 2)) + "%"

# Carica le immagini in openCV per consentirne la modifica
first_cv = cv2.imread(first_path)
second_cv = cv2.imread(second_path)

# Chiama la funzione per concateneare orizzontalmente le immagini
final_image = hconcat_resize_min([first_cv, second_cv])

# Prendo le grandezze finali dell'immagine
height, width = final_image.shape[:2]

# Scelgo un font
font = cv2.FONT_HERSHEY_DUPLEX
  
# Posiziono il testo in modo che risulti vicino al centro, /2 avrebbe fatto partire il testo dal centro preciso
org = (int(width/3), height)
  
# Scalo il testo in base all'altezza
fontScale = height/100
   
# Il font deve essere bianco
color = (255, 255, 255)
  
# Lo spessore del font è scalato insieme alla grandezza dello stesso
thickness = int(fontScale)
   
# Scrivo il testo sull'immagine
final_image = cv2.putText(final_image, distance, org, font, fontScale, 
                 color, thickness, cv2.LINE_AA)

# Scrive la nuova immagine
cv2.imwrite(final_path, final_image)