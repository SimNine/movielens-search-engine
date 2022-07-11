import React, { Component } from 'react';
import TextField from "@mui/material/TextField";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import MovieResults from './MovieResults';

class App extends Component {

  constructor(props) {
    super(props);

    this.movieMode = "movies";
    this.userMode = "users";
    this.maxNumPages = 9;

    this.state = {
      currentSearchTerm: "<default>",
      currentSearchMode: this.movieMode,
      resultDataRows: [],
      resultNumPages: 0,
      resultNumResults: 0,
      resultCurrPage: 1
    };
  }

  changeSearchTerm = (e) => {
    this.setState({
      currentSearchTerm: e.target.value,
      resultCurrPage: 1
    }, this.refreshResults);
  };

  changeSearchMode = (e) => {
    this.setState({
      currentSearchMode: e.target.value,
      resultCurrPage: 1
    }, this.refreshResults);
  };  

  refreshResults = () => {
    fetch('/search?mode=' + this.state.currentSearchMode + '&term='+ this.state.currentSearchTerm + '&page=' + this.state.resultCurrPage).then((res) => {
      return res.json();
    }).then((res) => {
      this.setState({
        resultDataRows: res.result,
        resultNumPages: res.num_pages,
        resultNumResults: res.num_results
      });
      console.log(res.num_pages)
      console.log(res.num_results)
    }).catch((err) => {
      this.setState({err});
    });
  }

  render = () => {
    let resultsTable
    if (this.state.currentSearchMode == this.movieMode) {
      resultsTable = <MovieResults resultRows={this.state.resultDataRows} />
    } else if (this.state.currentSearchMode == this.userMode) {
      resultsTable = <MovieResults resultRows={this.state.resultDataRows} />
    } else {
      resultsTable = <MovieResults />
    }

    let pageArrayMin, pageArrayMax
    if (this.state.resultNumPages <= this.maxNumPages ||
        this.state.resultCurrPage <= Math.floor(this.maxNumPages / 2)) {
      // 9 pages, bottom of range
      pageArrayMin = 1
      pageArrayMax = this.resultNumPages
    } else if (this.state.resultCurrPage >= this.state.resultNumPages - Math.floor(this.maxNumPages / 2)) {
      // 9 pages, top of range
      pageArrayMin = this.state.resultNumPages - this.maxNumPages + 1
      pageArrayMax = this.state.resultNumPages
    } else {
      // middle of range
      pageArrayMin = this.state.resultCurrPage - Math.floor(this.maxNumPages / 2)
      pageArrayMax = this.state.resultCurrPage + Math.floor(this.maxNumPages / 2)
    }

    let pageNumArray = Array.from(new Array(this.state.resultNumPages <= this.maxNumPages ? this.state.resultNumPages : this.maxNumPages), (x, i) => i + pageArrayMin);

    return (
      <div>
        <h1>Movie search:</h1>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-label">Mode</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.currentSearchMode}
            label="Mode"
            onChange={this.changeSearchMode}
          >
            <MenuItem value={this.movieMode}>Movies</MenuItem>
            <MenuItem value={this.userMode}>Users</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <TextField
            className="searchbox"
            onChange={this.changeSearchTerm}
            id="outlined-basic"
            variant="outlined"
            // fullWidth
            label="Search"
          />
        </FormControl>
        
        <h2>Num results: {this.state.resultNumResults}</h2>
        {resultsTable}
        <div>
          <IconButton aria-label="first" color="primary" disabled={this.state.resultCurrPage <= 1}
              onClick={() => {
                this.setState({
                  resultCurrPage: 1
                }, this.refreshResults);
              }}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton aria-label="previous" color="primary" disabled={this.state.resultCurrPage <= 1}
              onClick={() => {
                this.setState({
                  resultCurrPage: this.state.resultCurrPage - 1
                }, this.refreshResults);
              }}>
            <ArrowLeftIcon />
          </IconButton>
          {Array.from(pageNumArray, (e, i) => {
            let buttonKey = "pageButton" + e;
            if (e == this.state.resultCurrPage) {
              return <Button key={buttonKey} variant="contained" style={{ fontWeight: 600 }}>{e}</Button>
            }
            return <Button 
              key={buttonKey} 
              variant="outlined" 
              style={{ fontWeight: 600 }}
              onClick={() => {
                this.setState({
                  resultCurrPage: e
                }, this.refreshResults);
              }}>
              {e}
            </Button>
          })}
          <IconButton aria-label="next" color="primary" 
              disabled={this.state.resultCurrPage >= this.state.resultNumPages}
              onClick={() => {
                this.setState({
                  resultCurrPage: this.state.resultCurrPage + 1
                }, this.refreshResults);
              }}>
            <ArrowRightIcon />
          </IconButton>
          <IconButton aria-label="last" color="primary" 
              disabled={this.state.resultCurrPage >= this.state.resultNumPages}
              onClick={() => {
                this.setState({
                  resultCurrPage: this.state.resultNumPages
                }, this.refreshResults);
              }}>
            <SkipNextIcon />
          </IconButton>
          {/* {Array.from(Array(this.state.resultNumPages > this.maxNumPages ? this.maxNumPages : this.state.resultNumPages), (e, i) => {
            i += 1;
            let buttonKey = "pageButton" + (i + 1);
            if (i == this.state.resultCurrPage) {
              return <Button key={buttonKey} variant="contained" style={{ fontWeight: 600 }}>{i}</Button>
            }
            return <Button 
              key={buttonKey} 
              variant="outlined" 
              style={{ fontWeight: 600 }}
              onClick={() => {
                this.setState({
                  resultCurrPage: i
                }, this.refreshResults);
            }}>
              {i}
            </Button>
          })} */}
        </div>
      </div>
    );
  }

  componentDidMount() {
    fetch('/test').then((res) => {
      return res.json();
    }).then((res) => {
      this.setState({res});
    }).catch((err) => {
      this.setState({err});
    });
  }
}

export default App;
