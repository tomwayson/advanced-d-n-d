import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    insertRow(afterRow) {
      const rows = this.get('model.rows');
      let pos = 0;
      if (afterRow) {
        pos = rows.indexOf(afterRow) + 1;
      }
      rows.insertAt(pos, {
        message: 'This is row number: ' + (rows.length + 1),
        cards: [],
        style: {}
      });
    },
    onDragStart(e) {
      e.dataTransfer.setData('text/plain', 'insertRow');
    },
    onDrop(e, dragOverRow) {
      let action = e.dataTransfer.getData('text/plain');
      e.dataTransfer.clearData('text/plain');
      this.send(action, dragOverRow);
    }
  }
});
