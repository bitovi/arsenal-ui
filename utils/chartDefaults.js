var chartDefaults = {
  singleBarChart: {
    chart: {
      type: 'bar',
      backgroundColor: '#D14748',
      margin: [0, 0, 0, 0],
      spacing: [0, 0, 0, 0],
      borderRadius: 10
    },
    colors: ['#4D4D4D'],
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
        borderRadius: 10,
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
    colors: ['#DD8888', '#DD4444', '#DD0000'],
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
