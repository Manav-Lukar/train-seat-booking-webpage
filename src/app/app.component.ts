import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Train Seat Booking';

  // Define seating arrangement: 10 rows with 8 seats in each row (80 total seats)
  rows = 10;
  seatsPerRow = 8;

  // Generate seat numbers dynamically: [1, 2, 3,...80]
  seats = Array.from({ length: this.rows }, (_, rowIndex) =>
    Array.from({ length: this.seatsPerRow }, (_, seatIndex) => rowIndex * this.seatsPerRow + seatIndex + 1)
  );

  bookedSeats: number[] = [3, 15, 22, 34, 42]; // Example already booked seats
  selectedSeats: number[] = []; // Stores currently selected seats for booking
  maxSeats: number = 7; // Maximum seats a user can book in one go
  ticketPrice: number = 100; // Ticket price per seat
  errorMessage: string | null = null; // Error message displayed in case of seat selection issues
  isBookingComplete: boolean = false; // Track if the booking is complete

  // Function to find available seats and reserve them temporarily (without booking yet)
  findAvailableSeats(seatsToBook: number) {
    this.selectedSeats = []; // Clear previously selected seats
    let count = 0;

    // Step 1: Try to find enough adjacent seats in a single row
    for (let row of this.seats) {
      let availableSeatsInRow = row.filter(seat => !this.isBooked(seat)); // Get seats that are not booked
      if (availableSeatsInRow.length >= seatsToBook) {
        this.selectedSeats.push(...availableSeatsInRow.slice(0, seatsToBook)); // Select seats from the row
        count = seatsToBook; // Update the count of selected seats
        break; // Stop the loop once we've found the required number of seats
      }
    }

    // Step 2: If we couldn't find enough adjacent seats in one row, spread across multiple rows
    if (count < seatsToBook) {
      for (let row of this.seats) {
        for (let seat of row) {
          if (!this.isBooked(seat) && count < seatsToBook) {
            this.selectedSeats.push(seat); // Select available seats from different rows
            count++;
          }
        }
        if (count === seatsToBook) break; // Stop once we've selected the desired number of seats
      }
    }

    // If still not enough seats were found, show an error message
    if (count < seatsToBook) {
      this.errorMessage = `Not enough available seats. Found only ${count}.`;
      this.selectedSeats = []; // Reset selection if there are not enough seats
    } else {
      this.errorMessage = null; // Clear any previous error messages
    }
  }

  // Toggle seat selection manually when the user clicks on a seat
  toggleSeatSelection(seat: number) {
    if (this.isBooked(seat)) {
      return; // Prevent interaction with already booked seats
    }

    // If the seat is already selected, unselect it; otherwise, select it
    if (this.isSelected(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s !== seat);
    } else if (this.selectedSeats.length < this.maxSeats) {
      this.selectedSeats.push(seat); // Only allow selection up to maxSeats limit
    }
  }

  // Finalize booking and mark the selected seats as booked
  confirmBooking() {
    if (this.selectedSeats.length > 0) {
      this.bookedSeats.push(...this.selectedSeats); // Add selected seats to the booked list
      this.isBookingComplete = true; // Mark booking as complete
      this.selectedSeats = []; // Clear the selected seats after booking
      this.errorMessage = null; // Clear any previous error messages
    } else {
      this.errorMessage = 'Please select seats to book.'; // Show error if no seats are selected
    }
  }

  // Book seats after checking user input for number of seats
  bookSeats(numSeats: string) {
    const seatsToBook = parseInt(numSeats, 10); // Convert input to number
    if (seatsToBook > 0 && seatsToBook <= this.maxSeats) {
      this.selectedSeats = []; // Reset any previous selection
      this.findAvailableSeats(seatsToBook); // Find seats based on the number of requested seats
    } else {
      this.errorMessage = 'Please select a number between 1 and 7.'; // Error if the number of seats is invalid
    }
  }

  // Get appropriate CSS class for a seat based on its booking or selection status
  getSeatClass(seat: number) {
    if (this.isBooked(seat)) {
      return 'seat booked'; // CSS class for booked seats
    }
    if (this.isSelected(seat)) {
      return 'seat selected'; // CSS class for selected seats
    }
    return 'seat available'; // Default class for available seats
  }

  // Check if the seat is already booked
  isBooked(seat: number): boolean {
    return this.bookedSeats.includes(seat);
  }

  // Check if the seat is currently selected by the user
  isSelected(seat: number): boolean {
    return this.selectedSeats.includes(seat);
  }

  // Reset the booking process to allow the user to book new seats
  resetBooking() {
    this.isBookingComplete = false; // Reset booking state
    this.selectedSeats = []; // Clear selected seats
    this.errorMessage = null; // Clear any previous error messages
  }

  // Calculate the total price based on the number of booked seats
  getTotalPrice(): number {
    return this.bookedSeats.length * this.ticketPrice;
  }
}
