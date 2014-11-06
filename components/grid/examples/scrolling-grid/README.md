The scrolling grid is a bit funky. There are a few things you have to do to use it.

First, you need to extend it as in sandbox.js:

```js
ScrollingGrid.extend({
  scope: {
    columns: [...],
    atBottomHandler: function(done) {
      rows.push.apply(rows, _.times(50, i => {
        return {
          index: i,
          text1: 'Row ' + i,
          text2: 'Row ' + _.random(0, 1000000000),
          text3: 'Row ' + i
        };
      }));
      done();
    }
  }
});
```

Note that `atBottomhandler` function. That function gets called when the bottom of the grid is hit. **Make sure to call done() when you have made your changes to the grid.** So if you need to call out to a model.findAll or something, call done() after you've added those models to the rows.

Second, you need to specify column widths in your less file, like in sandbox.less:

```less
rn-scrolling-grid-example {
  table.scrolling {
    /* You have to specify widths */
    tr > th, tr > td {
      &:nth-of-type(1) {
        width: 40px;
      }
      &:nth-of-type(2) {
        width: 200px;
      }
      &:nth-of-type(3) {
        width: 100px;
      }
      &:nth-of-type(4) {
        width: 100px;
      }
    }
  }
}
```

This is not optimal, but it is necessary. You could use class names for the columns instead of doing them by order, as I have here.
