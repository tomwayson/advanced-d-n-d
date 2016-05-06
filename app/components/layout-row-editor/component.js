import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  tagName:'section',
  classNames: ['layout-row-editor', 'layout-section'],
  classNameBindings: ['active'],
  active: false,

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
      this.sendAction('onStartMove', e, this.model);
    }
  }
});
