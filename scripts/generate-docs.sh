if ! [ -d "docs" ]; then
    echo "\n[Error!] Docs directory does not exist\n\n"
    exit 2
fi

if ! [ $GITHUB_BRANCH == 'master' ]; then
    echo "\n[Error!] Are you sure you should be pushing docs to master?\n\n"
    exit 2
fi

cd docs
git init
git checkout -b $GITHUB_BRANCH
git add -A
git commit -a -m "Deployed at $(date)"
git remote add origin $GITHUB_URL
git push -f --dry-run origin $GITHUB_BRANCH
rm -Rf .git
