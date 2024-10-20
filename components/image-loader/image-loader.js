Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    defaultImg: {
      type: String,
      value: '/images/home.png'
    }
  },
  data: {
    imgSrc: ''
  },
  lifetimes: {
    attached() {
      console.log('Component attached, src:', this.properties.src);
      this.setData({ imgSrc: this.properties.src || this.properties.defaultImg });
    }
  },
  methods: {
    onError() {
      console.log('Image failed to load, using default image');
      this.setData({ imgSrc: this.properties.defaultImg });
    }
  }
});
