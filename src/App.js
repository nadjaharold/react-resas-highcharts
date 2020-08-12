import React, { Component } from "react";
import { AtomSpinner } from "react-epic-spinners";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import GitHubIcon from "@material-ui/icons/GitHub";
import Container from "@material-ui/core/Container";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Paper from "@material-ui/core/Paper";

let apiKey = process.env.REACT_APP_API_KEY;

class Loading extends Component {
  render() {
    return (
      <section style={{ width: "100vw", height: "100vh" }}>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: "auto",
            display: "flex",
            alignItems: "center",
            width: 300,
            height: 80,
          }}
        >
          <h1 style={{ marginRight: 20 }}>Now Loading...</h1>
          <AtomSpinner color="#ff1d5e" animationDuration="600" />
        </div>
      </section>
    );
  }
}
class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      selected: Array(47).fill(false),
      prefSet: [],
      series: [],
    };
    this._changeSelection = this._changeSelection.bind(this);
  }
  componentDidMount() {
    fetch("https://opendata.resas-portal.go.jp/api/v1/prefectures", {
      headers: { "X-API-KEY": apiKey },
    })
      .then((response) => response.json())
      .then((res) => {
        this.setState({ prefSet: res.result });
        setTimeout(() => {
          this.setState({ loading: false });
        }, 500);
      });
  }
  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();
    // selectedの真偽値を反転
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      // チェックされていなかった場合はデータを取得
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?prefCode=${
          index + 1
        }`,
        {
          headers: { "X-API-KEY": apiKey },
        }
      )
        .then((response) => response.json())
        .then((res) => {
          // console.log(res.result.data);
          let tmp = [];
          for (let j = 0; j < 18; j++) {
            tmp.push(res.result.data[0].data[j].value);
          }
          const res_series = {
            name: this.state.prefSet[index].prefName,
            data: tmp,
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series],
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      // チェック済みの場合はseriesから削除
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefSet[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy,
      });
    }
  }
  renderItem(props) {
    return (
      <FormGroup row key={props.prefCode} style={{ display: "inline-block" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.selected[props.prefCode - 1]}
              onChange={() => this._changeSelection(props.prefCode - 1)}
            />
          }
          label={props.prefName}
        />
      </FormGroup>
    );
  }
  render() {
    const obj = this.state.prefSet;
    const options = {
      title: {
        text: "The Graph of Total Population Transition by Prefecture in JAPAN",
      },
      chart: {
        type: "spline",
        backgroundColor: "transparent",
        height: 500,
      },
      // plotOptions: {
      //   series: {
      //     label: {
      //       connectorAllowed: false,
      //     },
      //     pointInterval: 5,
      //     pointStart: 1965,
      //   },
      // },
      xAxis: {
        labels: {
          style: {
            fontSize: "12px",
          },
        },
        title: {
          text: "データ提供年(単位: 年)",
        },
        type: "years",
        categories: [
          1960,
          1965,
          1970,
          1975,
          1980,
          1985,
          1990,
          1995,
          2000,
          2005,
          2010,
          2015,
          2020,
          2025,
          2030,
          2035,
          2040,
          2045,
        ],
        lineWidth: 2,
      },
      yAxis: {
        title: {
          text: "人口(単位: 人)",
        },
        labels: {
          formatter() {
            return this.value.toLocaleString();
          },
        },
        lineWidth: 2,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxheight: 400,
            },
            chartOptions: {
              legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "top",
              },
            },
          },
        ],
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        useHTML: true,
        formatter() {
          return this.points.map((point) => {
            return `
                <i style="
                  background-color:${point.color};
                  border-radius:50%;
                  display: inline-block;
                  height:6px;
                  margin-right:4px;
                  width:6px;"
                ></i>${
                  point.series.name
                }: <b>${point.y.toLocaleString()}</b><br>`;
          });
        },
      },
      credits: {
        enabled: false,
      },
      series: this.state.series,
    };
    if (this.state.loading) {
      return <Loading />;
    }
    return (
      <div className="App">
        <CssBaseline />

        <AppBar
          position="static"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "initial",
            alignItems: "center",
            padding: "15px 20px",
          }}
        >
          <Typography variant="h1" style={{ fontSize: 24, fontWeight: 500 }}>
            ResasAPI×HighCharts
          </Typography>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/nadjaharold/Nuxt-Resas-Highcharts"
          >
            <GitHubIcon
              fontSize="large"
              style={{
                color: "#FFFFFF",
                verticalAlign: "middle",
              }}
            />
          </a>
        </AppBar>
        <Container
          component="div"
          style={{
            backgroundColor: "#ffffff",
            width: "100vw",
            height: "100vh",
          }}
        >
          <h2 style={{ marginTop: 15, paddingTop: 30 }}>
            Check the Prefectures!
          </h2>
          <Paper
            elevation={3}
            variant="outlined"
            style={{ padding: "10px 20px", marginBottom: 40 }}
          >
            {Object.keys(obj).map((i) => this.renderItem(obj[i]))}
          </Paper>

          <HighchartsReact highcharts={Highcharts} options={options} />
        </Container>
      </div>
    );
  }
}

export default App;
