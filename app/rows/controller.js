import Ember from 'ember';

export default Ember.Controller.extend({

  _insertRow(row, afterRow) {
    const rows = this.get('model.rows');
    let pos = 0;
    if (afterRow) {
      pos = rows.indexOf(afterRow) + 1;
    }
    rows.insertAt(pos, row);
  },

  actions: {
    addRow(afterRow) {
      let newRow = {
        message: 'This is row number: ' + (this.get('model.rows').length + 1),
        cards: [],
        style: {}
      };
      this._insertRow(newRow, afterRow);
    },
    moveRow(afterRow, moveRow) {
      console.log('move ', moveRow.message, 'after ', afterRow.message);
      if (moveRow === afterRow) {
        return;
      }
      const rows = this.get('model.rows');
      rows.removeObject(moveRow);
      this._insertRow(moveRow, afterRow);
    },
    onDragStart(e) {
      e.dataTransfer.setData('text/plain', 'addRow');
    },
    onDrop(e, dragOverRow, moveRow) {
      let action = e.dataTransfer.getData('text/plain');
      e.dataTransfer.clearData('text/plain');
      this.send(action, dragOverRow, moveRow);
    }
  }
});
