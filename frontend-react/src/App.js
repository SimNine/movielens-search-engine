import React, { Component } from 'react';
import TextField from "@mui/material/TextField";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSearchTerm: "<default>",
      currentSearchMode: "movies",
      resultRows: []
    };
  }

  changeSearchTerm = (e) => {
    this.setState({
      currentSearchTerm: e.target.value
    }, this.refreshResults);
  };

  changeSearchMode = (e) => {
    this.setState({
      currentSearchMode: e.target.value
    }, this.refreshResults);
  };  

  refreshResults = () => {
    fetch('/search?mode=' + this.state.currentSearchMode + '&term='+ this.state.currentSearchTerm).then((res) => {
      return res.json();
    }).then((res) => {
      this.setState({
        resultRows: res.result
      });
    }).catch((err) => {
      this.setState({err});
    });
  }

  render = () => {
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
            <MenuItem value={"movies"}>Movies</MenuItem>
            <MenuItem value={"users"}>Users</MenuItem>
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
        
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell style={{ fontWeight: 600 }} align="right">Genre</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.resultRows.map((row) => (
                <TableRow key={row.title}>
                  <TableCell component="th" scope="row">{row.title}</TableCell>
                  <TableCell align="right">{row.genres}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <pre>state = {JSON.stringify(this.state, undefined, '  ')}</pre> */}
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
