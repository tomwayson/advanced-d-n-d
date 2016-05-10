import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['card-resizer'],
  classNameBindings:['isVisible:visible'],
  attributeBindings:['style'],

  style:Ember.computed('model.position', function(){
    let styleString = Ember.String.htmlSafe('');
    let pos = this.get('model.position');
    if(pos){
      styleString = Ember.String.htmlSafe('top:' + pos.top + 'px; height:' + pos.height + 'px;left:' + pos.left + 'px;');
    }
    return styleString;
  }),

  isVisible: Ember.computed('model.visible', function(){
    return this.get('model.visible');
  }),
  // DRAG OF RESIZER
  //
  // This is problematic as other event handlers are interfering
  //
  // state: {
  //   isDragging: false
  // },
  // mouseDown(event){
  //   console.log('Resizer Mouse Down X:' + event.clientX);
  //   this.state.isDragging = true;
  // },
  // mouseUp(event){
  //   console.log('Resizer Mouse Up X:' + event.clientX);
  //   this.state.isDragging = false;
  // },
  // mouseMove(event){
  //   if(this.state.isDragging){
  //     console.log('Dragging Resizer: X:' + event.clientX);
  //     this.set('model.position.left', event.clientX - 10);
  //     this.$().css({'left': event.clientX - 10});
  //   }else{
  //     //console.log('Resizer mousemove');
  //   }
  // },
  // mouseLeave(event){
  //   console.log('resizer mouseLeave');
  //   if(this.state.isDragging){
  //     this.state.isDragging = false;
  //   }
  //
  // },

  actions: {
    shiftRight(){
      console.log('Shift Splitter to the right...');
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),"right");
      this.set('model.visible', false);
    },
    shiftLeft(){
      console.log('Shift Splitter to the left...');
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),'left');
      this.set('model.visible', false);
    }

  }



});
