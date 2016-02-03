#Audit Builder
##This is a node module for combining two csvs and outputting a csv in an auditable format.
Assuming the csv rows are fairly similar, this module uses the Levenshtein number to find the
closest match row in the other csv.  Then it stacks them on top of each other, and finally outputs
an ouput.csv that can be used in Excel or whatever to compare the data.

```
var ab = require('./audit_builder');
ab.compare('file1.csv', 'file2.csv');
```
