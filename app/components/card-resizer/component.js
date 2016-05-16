/**
 * card-resizer/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['card-resizer'],
  classNameBindings:['isVisible:visible'],
  attributeBindings:['style'],

  style:Ember.computed('model.position', function(){
    let styleString = Ember.String.htmlSafe('');
    let pos = this.get('model.position');
    if(pos){
      let ht = pos.height - 100;
      let tp = pos.top + 50;
      styleString = Ember.String.htmlSafe('top:' + tp + 'px; height:' + ht + 'px;left:' + pos.left + 'px;');
    }
    return styleString;
  }),

  isVisible: Ember.computed('model.visible', function(){
    return this.get('model.visible');
  }),

  controlContainerStyle: Ember.computed('model.position', function(){
    let styleString = Ember.String.htmlSafe('');
    let pos = this.get('model.position');
    if(pos){
      let tp = ((pos.height - 100) / 2) - 10;
      styleString = Ember.String.htmlSafe('top:' + tp + 'px;');
    }
    return styleString;
  }),

  actions: {
    shiftRight(){
      this.set('model.visible', false);
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),"right");

    },
    shiftLeft(){
      this.set('model.visible', false);
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),'left');

    }

  }



});
