AMC SiteFlow — Final Update

Is package mein aapki requested changes hain:
1. User Management: Admin ko har user ke liye Edit/Delete buttons milenge.
2. Current Admin bhi apna profile/role/status edit kar sakta hai aur apna account delete kar sakta hai.
3. User Delete Firebase Authentication account + Firestore users profile dono delete karta hai.
4. Add User form mein password + confirm password fields fix kiye gaye hain.
5. Calculators section mein Scientific Calculator button diya gaya hai.
6. Scientific Calculator mein sin/cos/tan, inverse trig, sqrt, log, ln, powers, parentheses aur basic arithmetic hai.
7. Geometry calculator mein rectangle, square, circle, triangle, trapezoid, parallelogram, rhombus, sector, cuboid, cube, cylinder, cone, sphere aur hemisphere ke calculations hain.
8. 2D shapes ke liye area/perimeter aur 3D shapes ke liye volume/surface area calculate hota hai.
9. Existing Material/Oil/Attendance/Billing/Concrete calculator functionality ko preserve kiya gaya hai.

IMPORTANT — User Delete ke liye Firebase Cloud Function deploy karna zaroori hai:

1. Project folder mein is package ke files copy karein.
2. CMD mein project folder open karein.
3. Run:
   cd functions
   npm install
   cd ..
4. Firebase CLI se login (agar pehle nahi kiya):
   firebase login
5. Function deploy karein:
   firebase deploy --only functions
6. Deploy complete hone ke baad localhost server dobara start karein:
   python -m http.server 5500
7. Browser:
   http://localhost:5500/login.html

Agar aapka existing Firestore rules setup already working hai, use bina zarurat replace na karein.

NOTE:
- User Edit mein name, role aur status update hote hain.
- Firebase Authentication email/password ko profile editor se silently change nahi kiya jata.
- User Delete backend Cloud Function ke through secure Admin check ke saath hota hai.
