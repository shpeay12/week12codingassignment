(function($, undefined) {

    document.addEventListener('DOMContentLoaded', fetchBuses);

    async function fetchBuses() { //async function
        try {    //promise to get buses from mockAPI
            const response = await fetch('https://64f2261e0e1e60602d24d30d.mockapi.io/buses');
            const data = await response.json();
            populateBusDropdown(data);   //Invokes populateBusDropdown and pases the data through it.
        } catch (error) {
            console.error("Error fetching buses:", error);
        }
        displayStudents()  //invokes displayStudents function
    }

    $('#busDropdown').on('change', async function(event) { //Event binder, uses async function
        const selectedBusId = $(this).val(); //Allows bus number to be selected
        if (selectedBusId) { //promise to get students associated with each bus using mockAPI
            try {
                const response = await fetch(`https://64f2261e0e1e60602d24d30d.mockapi.io/students?busId=${selectedBusId}`);
                const students = await response.json();
                displayStudents(students); //Invokes displayStudents function and passes students in.
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        }
    });
    
    function populateBusDropdown(buses) { //function to populate the bus dropdown menus.
        const $busDropdown = $('#busDropdown'); //bus dropdown menu in student chart
        const $busDropdownForAddingStudent = $('#busDropdownForAddingStudent'); //bus dropdown menu for adding a student form

        buses.forEach(bus => { //loops through each bus using forEach method
            const option1 = document.createElement('option'); //lists each bus as an option to click on.
            const option2 = document.createElement('option');

            option1.value = bus.id; //Links options to bus IDs
            option2.value = bus.id;

            option1.textContent = bus.busNumber; //links options to bus numbers that will be displayed.
            option2.textContent = bus.busNumber;

            $(busDropdown).append(option1); //Lists the options as appended in each dropwdown menu.
            $(busDropdownForAddingStudent).append(option2);
        });
    }
    
    $('#add-new-bus').on('click', function () { //button to add new bus
        const busNumber = $('#new-bus-number').val(); //allows the typed bus number to be added to dropdown menus.
        if (!busNumber) { //error message
            alert('Please enter a bus number!');
            return;
        }

        const data = { //data for bus number
            busNumber: busNumber
        };

        $.ajax({ //ajax used to post bus numbers from mock API.
            url: 'https://64f2261e0e1e60602d24d30d.mockapi.io/buses', //mockAPI url
            type: 'POST', //posts data
            dataType: 'json', //JSON data type
            contentType: 'application/json', 
            data: JSON.stringify(data), //stringifys the data
            success: function (response) { //When successfull, responds with fetchBuses function and then clears bus number from form.
                fetchBuses();
                $('#new-bus-number').val('');
            }
        });
    });

$('#add-student').on('click', function () { //gives add student button functionality in add student form.
    const selectedBusId = $('#busDropdownForAddingStudent').val(); //busID is the selected bus.
    if (!selectedBusId) { //If no bus is selected, error message will display
        alert('Please select a bus first!');
        return;
    }

    const data = { //data for add student form.
        busId: selectedBusId,
        studentName: $('#student-name').val(),
        studentAddress: $('#student-address').val(),
        pickupTime: $('#pickup').val(),
        dropOffTime: $('#dropoff').val(),
        phoneNumber: $('#phone-number').val(),
        school: $('#school').val(),
        grade: $('#grade').val()
    };

    $.ajax({ //ajax used to get data from mockAPI for students
        url: 'https://64f2261e0e1e60602d24d30d.mockapi.io/students',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            fetchStudentsByBus(selectedBusId);
            clearForm();  // Clears the student form
        }
    });
});

function editStudent(studentId) { //function to edit student info
    $.ajax({ //Grabs the student info by the studentId
        url: `https://64f2261e0e1e60602d24d30d.mockapi.io/students/${studentId}`,
        type: 'GET',
        dataType: 'json',
        success: function (student) { //student information
            $('#student-name').val(student.studentName);
            $('#student-address').val(student.studentAddress);
            $('#pickup').val(student.pickupTime);
            $('#dropoff').val(student.dropOffTime);
            $('#phone-number').val(student.phoneNumber);
            $('#school').val(student.school);
            $('#grade').val(student.grade);
        }
    });

    $('#edit-save-btn').on('click', function() { //gives edit button functionality
        const studentId = $(this).data('student-id'); // Retrieves the student id
    
        const data = { //student data to edit
            studentName: $('#student-name').val(),
            studentAddress: $('#student-address').val(),
            pickupTime: $('#pickup').val(),
            dropOffTime: $('#dropoff').val(),
            phoneNumber: $('#phone-number').val(),
            school: $('#school').val(),
            grade: $('#grade').val()
        };
    
        $.ajax({ //puts new student info on student chart
            url: `https://64f2261e0e1e60602d24d30d.mockapi.io/students/${studentId}`,
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                const selectedBusId = $('#busDropdown').val();
                fetchStudentsByBus(selectedBusId);
            }
        });
    });
}


    function deleteStudent(studentId) { //function to delete students
        const selectedBusId = $('#busDropdown').val();

        $.ajax({ //ajax used to delete student info from mockAPI
            url: 'https://64f2261e0e1e60602d24d30d.mockapi.io/students/' + studentId,
            type: 'DELETE',
            success: function() {
                $('#student-' + studentId).remove();
                fetchStudentsByBus(selectedBusId);
            },
            error: function() {
                alert('There was an error deleting the student.');
            }
        });
    }

    function displayStudents(students) { //function to display students
        const $tableBody = $('#students').find('tbody'); //finds table body
        $tableBody.empty();  // Clear previous entries

        students.forEach(student => { //Iterates through students and adds student data to the row.
            const $row = $('<tr>').attr('id', 'student-' + student.id);
            $row.append($('<td>').text(student.studentName));
            $row.append($('<td>').text(student.studentAddress));
            $row.append($('<td>').text(student.pickupTime));
            $row.append($('<td>').text(student.dropOffTime));
            $row.append($('<td>').text(student.phoneNumber));
            $row.append($('<td>').text(student.school));
            $row.append($('<td>').text(student.grade));

            const $editBtn = $('<button>').text('Edit').addClass('btn btn-info'); //Creates edit button
            $editBtn.on('click', function() { //Gives edit button functionality
                editStudent(student.id); //Invokes editStudent function and passes through student.id
            });

            const $deleteBtn = $('<button>').text('Delete').addClass('btn btn-danger'); //Creates delete button
            $deleteBtn.on('click', function() { //Gives delete button functionality
                deleteStudent(student.id); //Calls deleteStudent function and passes through student.id
            });

            $row.append($('<td>').append($editBtn, $deleteBtn)); //Appends table data by either editing or removing data
            $tableBody.append($row); //adds new row with updated info
        });
    }

    



    function fetchStudentsByBus(selectedBusId) { //Function to fetch the students by the bus using busID
        $.ajax({ //Ajax used to get students by busID from mockAPI
            url: `https://64f2261e0e1e60602d24d30d.mockapi.io/students?busId=${selectedBusId}`,
            type: 'GET',
            dataType: 'json',
            success: function (students) {
                displayStudentsInTable(students); //displays students in table.
            }
        });
    }

    
    function clearForm() {
        $('#student-name').val('');
        $('#student-address').val('');
        $('#pickup').val('');
        $('#dropoff').val('');
        $('#phone-number').val('');
        $('#school').val('');
        $('#grade').val('');
    };

    
})(jQuery);
