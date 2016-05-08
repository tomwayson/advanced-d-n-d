import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  tagName:'section',
  classNames: ['layout-row-editor', 'layout-section'],
  classNameBindings: ['active'],
  active: false,

  // set the drag image
  _setDragImage(e) {
    if (!e.dataTransfer || !e.dataTransfer.setDragImage) {
      return;
    }
    const $row = this.$();
    const $handle = this.$(e.target);
    // b/c we're dragging from upper right corner,
    // want to shift to the left by width of the element
    e.dataTransfer.setDragImage($row[0], $row.outerWidth() - ($handle.outerWidth() / 2), $handle.outerHeight() / 2);
  },

  dragEnter(e) {
    this.set('active', true);
    this.sendAction('onDragEnter', e, this.model);
    return false;
  },
  dragOver(e) {
    this.set('active', true);
    this.sendAction('onDragOver', e, this.model);
    return false;
  },
  dragLeave(e) {
    this.set('active', false);
    this.sendAction('onDragLeave', e, this.model);
    return false;
  },
  drop(e) {
    this.set('active', false);
    this.sendAction('onDrop', e, this.model);
    // don't return false, we want this to bubble
    return true;
  },
  actions: {
    onRowDragStart (e) {
      e.dataTransfer.setData('text/plain', 'moveRow');
      this._setDragImage(e);
      this.sendAction('onStartMove', e, this.model);
    }
  }
});
