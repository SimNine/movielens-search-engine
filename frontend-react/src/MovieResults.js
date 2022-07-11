import React, { Component } from 'react';
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

class MovieResults extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   resultRows: []
    // };
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    console.log("MovieResults pane value changed")
    this.setState({resultRows: e.target.value})
  }

  render = () => {
    return (
        <TableContainer>
            <Table aria-label="simple table">
            <TableHead>
                <TableRow>
                <TableCell style={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell style={{ fontWeight: 600 }} align="right">Genre</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {this.props.resultRows.map((row) => (
                <TableRow key={row.title}>
                    <TableCell component="th" scope="row">{row.title}</TableCell>
                    <TableCell align="right">{row.genres}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
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

export default MovieResults;
