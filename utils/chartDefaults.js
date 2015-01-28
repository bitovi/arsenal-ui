var chartDefaults = {
  singleBarChart: {
    chart: {
      type: 'bar',
      backgroundColor: '#BDBDBD', //setting this as the standard color.Override if you want it in local implentaion
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0]
    },
    colors: ['#81ED6A'],
    yAxis: {
      min: 0,
      max: 100,
      gridLineWidth: 0
    },
    legend: {
      enabled: false
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
    },
    plotOptions: {
      bar: {
        borderWidth: 0,
        groupPadding: 0,
        pointPadding: 0,
        animation: false
      }
    },
    title: {
      style: {
        display: 'none'
      }
    },
    tooltip: {
      enabled: false
    }
  },

  singleStackedColumnChart: {
    chart: {
      type: 'column',
      backgroundColor: '#CCCCCC',
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0]
    },
    colors: ['#C63838', '#CC4C4C', '#D26060'],
    yAxis: {
      min: 0,
      gridLineWidth: 0
    },
    legend: {
      enabled: false
    },
    navigation: {
      buttonOptions: {
        enabled: false
      }
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        groupPadding: 0,
        pointPadding: 0,
        animation: false,
        stacking: 'percent',
        dataLabels: {
          enabled: true,
          formatter: function(val) { return this.y + '%'; },
          color: 'white'
        }
      }
    },
    title: {
      style: {
        display: 'none'
      }
    },
    tooltip: {
      enabled: false
    }
  }
};

export default chartDefaults;
