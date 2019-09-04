DIR="out"

if ! [ -d $DIR ]; then
    echo "\n[Error!] Docs directory does not exist\n\n"
    exit 2
fi

cd $DIR
git init
touch .nojekyll
git checkout -b gh-pages
git add -A
git commit -a -m "Deployed at $(date)"
git remote add origin https://github.com/prismyland/prismy.git
git push -f origin gh-pages
rm -Rf .git
