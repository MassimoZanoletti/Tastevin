rmdir /S /Q  dist
call ng build -c production
echo "Caricare sul server il contenuto di dist\tastevin\browser"
echo "(le API PHP in api\ si caricano a parte, in /code/bend/tastevin)"
echo "FINE!"
