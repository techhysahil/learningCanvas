## Advanced Git

Functions:
* cat-file
* hash-object

```$xslt
git cat-file -t bf1675  ===> file info
git cat-file -p bf1675  ===> file content info

echo "hello world" | git hash-object -w --stdin

```
