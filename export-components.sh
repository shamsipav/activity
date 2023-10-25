#!/bin/bash

files=src/lib/components/*.svelte
index=src/lib/components/index.ts

rm $index
for file in $files;
do
    xbase=${file##*/}
    xfext=${xbase##*.}
    xpref=${xbase%.*}
    echo "import $xpref from './$xbase'" >> $index
done

echo "" >> $index
echo "export { " >> $index
for file in $files;
do
    xbase=${file##*/}
    xfext=${xbase##*.}
    xpref=${xbase%.*}
    echo "    $xpref,"  >> $index
done
echo "}" >> $index

echo "✅ Components are re-exported successfully"