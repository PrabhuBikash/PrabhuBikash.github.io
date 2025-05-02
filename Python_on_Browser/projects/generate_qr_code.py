import qrcode

# Define the Python code you want to run
python_code = """import random

x = str(random.randint(0, 9))
while True:
    y = input("Try to guess what the number is. Hints: it's between 0 and 9. ")
    if x == y:
        print("You got it!")
        break
    else:
        print("Nope, try once more.")
"""

# Generate the QR code
qr = qrcode.QRCode()
qr.add_data(python_code)
qr.make(fit=True)

# Save the QR code as a PNG file
qr_filename = "python_code_qr.png"
qr.make_image(fill_color="black", back_color="white").save(qr_filename)

print(f"QR code saved as {qr_filename}")
js.loadImageIntoimageModal(qr_filename,'image/png')