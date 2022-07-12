import {
  AppBar,
  Button,
  LinearProgress,
  Container,
  createTheme,
  CssBaseline,
  FormControlLabel,
  Grid,
  MuiThemeProvider,
  Paper,
  styled,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { Component, Fragment } from "react";
import { Bar, Line } from "react-chartjs-2";

const IS_DARK = window.matchMedia("(prefers-color-scheme: dark)").matches;

const getTheme = (isDark) => {
  const palette = { type: isDark ? "dark" : "light" };
  return createTheme({ palette });
};

const styles = {
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  padding: {
    padding: 16,
  },
  dataGrid: {
    height: 112 + 32 * 10,
  },
  flag: {
    height: 128,
    boxShadow: "rgba(3, 102, 214, 0.3) 0px 0px 0px 3px",
  },
};

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDark: IS_DARK,
    };
  }

  render() {
    const formControlProps = {
      label: this.state.isDark ? "Dark" : "Light",
      control: (
        <Switch
          checked={this.state.isDark}
          onChange={(e) => {
            this.setState({ isDark: !this.state.isDark });
          }}
        />
      ),
    };
    return (
      <MuiThemeProvider theme={getTheme(this.state.isDark)}>
        <CssBaseline />
        <AppBar color="primary" position="static">
          <Toolbar style={styles.flexBetween}>
            <Typography variant="h5">COVID-19 Tracker</Typography>
            <FormControlLabel {...formControlProps} />
          </Toolbar>
        </AppBar>
        <Container style={styles.padding}>{this.props.children}</Container>
      </MuiThemeProvider>
    );
  }
}

const Item = styled(Paper)(function ({ theme }) {
  return {
    ...theme.typography.body2,
    padding: theme.spacing(0),
    margin: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  };
});

function truncateData(data) {
  return data.filter(function (_, id) {
    return id % 30 === 0;
  });
}

class WorldwideHistoricalChart extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      data: {},
    };
  }

  async componentDidMount() {
    const response = await fetch(
      "https://disease.sh/v3/covid-19/historical/all?lastdays=all"
    );
    const { cases, recovered, deaths } = await response.json();
    const labels = truncateData(Object.keys(cases));
    const datasets = [
      {
        label: "Cases",
        data: truncateData(Object.entries(cases)),
        fill: false,
        borderColor: "#3f51b5",
      },
      {
        label: "Recovered",
        data: truncateData(Object.entries(recovered)),
        fill: false,
        borderColor: "#ffb142",
      },
      {
        label: "Deaths",
        data: truncateData(Object.entries(deaths)),
        fill: false,
        borderColor: "#f50057",
      },
    ];
    const data = { labels, datasets };
    this.setState({ loading: false, data });
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else {
      const lineChartProps = {
        data: this.state.data,
        height: 400,
        options: {
          animation: true,
          showLine: true,
          hover: {
            mode: "nearest",
            intersect: false,
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      };
      return <Line {...lineChartProps} />;
    }
  }
}

class WorldwideStats extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      data: {},
    };
  }

  async componentDidMount() {
    const response = await fetch("https://disease.sh/v3/covid-19/all");
    const data = await response.json();
    this.setState({ loading: false, data });
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else {
      const {
        cases,
        todayCases,
        recovered,
        todayRecovered,
        deaths,
        todayDeaths,
        active,
        critical,
        affectedCountries,
      } = this.state.data;
      return (
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Typography variant="body2">Cases</Typography>
            <Typography variant="body1">
              {cases.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Cases Today</Typography>
            <Typography variant="body1">
              +{todayCases.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Recovered</Typography>
            <Typography variant="body1">
              {recovered.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Recovered Today</Typography>
            <Typography variant="body1">
              +{todayRecovered.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Deaths</Typography>
            <Typography variant="body1">
              {deaths.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Died Today</Typography>
            <Typography variant="body1">
              +{todayDeaths.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Active</Typography>
            <Typography variant="body1">
              {active.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Critical</Typography>
            <Typography variant="body1">
              {critical.toLocaleString("en-US")}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">Affected Countries</Typography>
            <Typography variant="body1">
              {affectedCountries.toLocaleString("en-US")}
            </Typography>
          </Grid>
        </Grid>
      );
    }
  }
}

class CountryTable extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      data: {},
    };
  }

  async componentDidMount() {
    const response = await fetch("https://disease.sh/v3/covid-19/countries");
    const result = await response.json();
    const sortedResult = result.sort(function (current, next) {
      return current.cases > next.cases ? -1 : 1;
    });
    const rows = sortedResult.map(function (item, id) {
      const { country, cases } = item;
      return { id, country, cases };
    });
    const columns = [
      { 
        field: "country", 
        headerName: "COUNTRY", 
        width: 180, 
        sortable: false 
      },
      {
        field: "cases",
        headerName: "CASES",
        width: 150,
        sortable: false,
        align: "right",
        headerAlign: "right",
        type: "number"
      },
    ];
    const data = { rows, columns };
    this.setState({ loading: false, data });
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else {
      return (
        <div style={styles.dataGrid}>
          <DataGrid
            {...this.state.data}
            pageSize={10}
            rowsPerPageOptions={[10]}
            rowHeight={32}
          />
        </div>
      );
    }
  }
}

class ContinentChart extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      data: {},
    };
  }

  async componentDidMount() {
    const response = await fetch("https://disease.sh/v3/covid-19/continents");
    const result = await response.json();
    const labels = result.map(function (item) {
      return item.continent;
    });
    const cases = result.map(function (item) {
      return item.cases;
    });
    const recovered = result.map(function (item) {
      return item.recovered;
    });
    const deaths = result.map(function (item) {
      return item.deaths;
    });
    const datasets = [
      {
        label: "Cases",
        data: Object.entries(cases),
        fill: false,
        barThickness: 4,
        backgroundColor: "#3f51b5",
      },
      {
        label: "Recovered",
        data: Object.entries(recovered),
        fill: false,
        barThickness: 4,
        backgroundColor: "#ffb142",
      },
      {
        label: "Deaths",
        data: Object.entries(deaths),
        fill: false,
        barThickness: 4,
        backgroundColor: "#f50057",
      },
    ];
    const data = { labels, datasets };
    this.setState({ loading: false, data });
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else {
      const barChartProps = {
        data: this.state.data,
        height: 432,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      };
      return <Bar {...barChartProps} />;
    }
  }
}

function CountryStats(props) {
  let data = {};
  for (let key in props.data) {
    data[key] = props.data[key].toLocaleString("en-US");
  }
  const {
    cases,
    todayCases,
    recovered,
    todayRecovered,
    deaths,
    todayDeaths,
    active,
    critical,
  } = data;
  return (
    <Grid container spacing={4}>
      <Grid item xs={6}>
        <Typography variant="body2">Cases</Typography>
        <Typography variant="body1">{cases}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Cases Today</Typography>
        <Typography variant="body1">+{todayCases}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Recovered</Typography>
        <Typography variant="body1">{recovered}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Recovered Today</Typography>
        <Typography variant="body1">+{todayRecovered}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Deaths</Typography>
        <Typography variant="body1">{deaths}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Died Today</Typography>
        <Typography variant="body1">+{todayDeaths}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Active</Typography>
        <Typography variant="body1">{active}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2">Critical</Typography>
        <Typography variant="body1">{critical}</Typography>
      </Grid>
    </Grid>
  );
}

class CountryHistoricalChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: {},
    };
  }

  async componentDidMount() {
    const response = await fetch(
      `https://disease.sh/v3/covid-19/historical/${this.props.country}?lastdays=all`
    );
    const {
      timeline: { cases, recovered, deaths },
    } = await response.json();
    const labels = truncateData(Object.keys(cases));
    const datasets = [
      {
        label: "Cases",
        data: truncateData(Object.entries(cases)),
        fill: false,
        borderColor: "#3f51b5",
      },
      {
        label: "Recovered",
        data: truncateData(Object.entries(recovered)),
        fill: false,
        borderColor: "#ffb142",
      },
      {
        label: "Deaths",
        data: truncateData(Object.entries(deaths)),
        fill: false,
        borderColor: "#f50057",
      },
    ];
    const data = { labels, datasets };
    this.setState({ loading: false, data });
  }

  render() {
    if (this.state.loading) {
      return <LinearProgress />;
    } else {
      const lineChartProps = {
        data: this.state.data,
        height: 400,
        options: {
          animation: true,
          showLine: true,
          hover: {
            mode: "nearest",
            intersect: false,
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      };
      return <Line {...lineChartProps} />;
    }
  }
}

class CountryTracker extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      input: "",
      country: "",
      data: {},
      info: {},
      error: false,
    };
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!!this.state.country && prevState.country !== this.state.country) {
      this.setState({ loading: true });
      const response = await fetch(
        `https://disease.sh/v3/covid-19/countries/${this.state.country}`
      );
      if (response.status === 200) {
        const {
          country,
          continent,
          countryInfo: { flag },
          cases,
          todayCases,
          recovered,
          todayRecovered,
          deaths,
          todayDeaths,
          active,
          critical,
        } = await response.json();
        const info = { country, continent, flag };
        const data = {
          cases,
          todayCases,
          recovered,
          todayRecovered,
          deaths,
          todayDeaths,
          active,
          critical,
        };
        this.setState({ loading: false, error: false, info, data });
      } else {
        this.setState({ loading: false, error: true, info: {}, data: {} });
      }
    }
  }

  render() {
    return (
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Toolbar>
            <TextField
              disabled={this.state.loading}
              fullWidth
              required
              error={this.state.error}
              label="Country"
              variant="standard"
              value={this.state.input}
              onChange={(e) => this.setState({ input: e.target.value })}
            />
            <Button
              disabled={this.state.loading || !this.state.input}
              variant="contained"
              color="primary"
              onClick={() => this.setState({ country: this.state.input })}
            >
              Track
            </Button>
          </Toolbar>
        </Grid>
        {this.state.loading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : this.state.error || !this.state.country ? (
          <Grid item xs={12}>
            <Typography variant="body1">Nothing to show</Typography>
          </Grid>
        ) : (
          <Fragment>
            <Grid item md={4} xs={12}>
              <img style={styles.flag} src={this.state.info.flag} alt="Country flag" />
              <Typography variant="body1">{this.state.info.country}</Typography>
              <Typography variant="body2">
                {this.state.info.continent}
              </Typography>
              <br />
              <CountryStats data={this.state.data} />
            </Grid>
            <Grid item md={8} xs={12}>
              <CountryHistoricalChart country={this.state.country} />
            </Grid>
          </Fragment>
        )}
      </Grid>
    );
  }
}

function App() {
  return (
    <Layout>
      <Typography variant="h4">Worldwide Stats</Typography>
      <Item style={styles.padding}>
        <Grid container spacing={4}>
          <Grid item md={8} xs={12}>
            <WorldwideHistoricalChart />
          </Grid>
          <Grid item md={4} xs={12}>
            <WorldwideStats />
          </Grid>
        </Grid>
      </Item>
      <Grid container spacing={0}>
        <Grid item md={4} xs={12}>
          <Typography variant="h4">Countries</Typography>
          <Item style={styles.padding}>
            <CountryTable />
          </Item>
        </Grid>
        <Grid item md={8} xs={12}>
          <Typography variant="h4">Continents</Typography>
          <Item style={styles.padding}>
            <ContinentChart />
          </Item>
        </Grid>
      </Grid>
      <Typography variant="h4">Track Your Country</Typography>
      <Item style={styles.padding}>
        <CountryTracker />
      </Item>
      <Item style={styles.padding}>
        <Typography variant="body2">With ❣️ by Dani</Typography>
      </Item>
    </Layout>
  );
}

export default App;
