const stopwatch = document.getElementById("stopwatch");
let rawSeconds = 0;

const formatSeconds = (seconds) => {
  const date = new Date(null);
  date.setSeconds(seconds); // specify value for SECONDS here
  return date.toISOString().slice(11, 19);
};

const pie = document.getElementById("pie");
let recordingTask = false;
let currentTask;

function deleteTask(taskName) {
  var taskHistory = JSON.parse(localStorage.getItem("taskHistory")) || [];
  taskHistory = taskHistory.filter((task) => task.task !== taskName);
  localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
  updateTaskHistory();
}

const chart = new Chart(pie, {
    type: 'pie',
    data: {
      labels: ["Productive Tasks", "Unproductive Tasks"],
      datasets: [{
        label: "Task Minutes",
        backgroundColor: ["black", "grey"],
        data: [50, 50]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Productivity'
      },
      responsive: true,
      maintainAspectRatio: false
    }
});

function updateTaskHistory() {
  var taskHistory = JSON.parse(localStorage.getItem("taskHistory")) || [];
  var taskHistoryTable = document.getElementById("taskHistory");
  taskHistoryTable.getElementsByTagName("tbody")[0].innerHTML = "";
  for (var i = 0; i < taskHistory.length; i++) {
    var task = taskHistory[i].task;
    const date = taskHistory[i].date;
    var row = document.createElement("tr");
    var taskCell = document.createElement("td");
    var dateCell = document.createElement("td");
    var controlsCell = document.createElement("td");
    var deleteButton = document.createElement("button");
    const productiveCell = document.createElement("td");
    const editButton = document.createElement("button");
    const editInput = document.createElement("input");
    const taskSeconds = taskHistory[i].seconds;
    const taskDuration = formatSeconds(taskSeconds);
    const durationCell = document.createElement("td");
    durationCell.innerText = taskDuration;
    let isEditing = false;
    editInput.type = "text";
    editInput.style.display = "none";
    editInput.style.width = "110px";
    editInput.placeholder = "New name...";
    deleteButton.innerText = "Delete";
    const stopEditing = () => {
      isEditing = false;
      editButton.innerText = "Edit";
      editInput.style.display = "none";
      deleteButton.innerText = "Delete";
    };
    deleteButton.onclick = function () {
      if (isEditing) {
        stopEditing();
      } else {
        deleteTask(task);
      }
    };
    editButton.innerText = "Edit";
    editButton.onclick = function () {
      if (isEditing) {
        stopEditing();
        localStorage.setItem(
          "taskHistory",
          JSON.stringify(
            JSON.parse(localStorage.getItem("taskHistory")).map((i) => {
              return i.task == task
                ? {
                    task: editInput.value,
                    date: date,
                    isProductive: i.isProductive,
                    seconds: i.seconds,
                  }
                : i;
            })
          )
        );
        updateTaskHistory();
      } else {
        isEditing = true;
        editInput.style.display = "block";
        editButton.innerText = "Save";
        deleteButton.innerText = "Cancel";
      }
    };
    controlsCell.appendChild(editButton);
    taskCell.innerHTML = task;
    dateCell.innerHTML = date;
    productiveCell.innerText = taskHistory[i].isProductive ? "Yes" : "No";
    controlsCell.appendChild(deleteButton);
    controlsCell.appendChild(editInput);
    row.appendChild(taskCell);
    row.appendChild(dateCell);
    row.appendChild(controlsCell);
    row.appendChild(productiveCell);
    row.appendChild(durationCell);
    taskHistoryTable
      .getElementsByTagName("tbody")[0]
      .insertAdjacentElement("afterbegin", row);
    const productiveMinutes = taskHistory
      .filter((i) => i.isProductive)
      .reduce((partialSum, a) => partialSum + a.seconds, 0) / 60;
    const unproductiveMinutes = taskHistory
      .filter((i) => !i.isProductive)
      .reduce((partialSum, a) => partialSum + a.seconds, 0) / 60;
    
    chart.data.datasets[0].data[0] = productiveMinutes;
    chart.data.datasets[0].data[1] = unproductiveMinutes;
    chart.update();
    
  }
}

window.addEventListener("load", function () {
  updateTaskHistory();
});

let stopwatchHidden = true;
const stopwatchToggle = document.getElementById("toggleStopwatch");

const updateStopwatchToggle = () => {
  stopwatch.style.display = stopwatchHidden ? "none" : "block";
  this.innerText = `${stopwatchHidden ? "Show" : "Hide"} Stopwatch`;
};

stopwatchToggle.addEventListener("click", function () {
  stopwatchHidden = !stopwatchHidden;
  stopwatch.style.display = stopwatchHidden ? "none" : "block";
  this.innerText = `${stopwatchHidden ? "Show" : "Hide"} Stopwatch`;
});

document.getElementById("toggleTask").addEventListener("click", function () {
  stopwatchHidden = recordingTask;
  recordingTask = !recordingTask;
  updateStopwatchToggle();
  this.innerText = `${recordingTask ? "Stop" : "Start"} Task`;
  if (recordingTask) {
    const taskName = document.getElementById("task").value;
    const taskHistory = JSON.parse(localStorage.getItem("taskHistory")) || [];
    taskHistory.push({
      task: taskName,
      date: new Date().toLocaleDateString(),
      isProductive: document.getElementById("productive").checked,
      seconds: rawSeconds,
    });
    localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
    currentTask = taskName
    updateTaskHistory();
  };
});

setInterval(() => {
  if (recordingTask) {
    stopwatch.innerText = formatSeconds(rawSeconds);
    localStorage.setItem(
      "taskHistory",
      JSON.stringify(
        JSON.parse(localStorage.getItem("taskHistory")).map((i) => {
          return i.task == currentTask
            ? {
                task: currentTask,
                date: i.date,
                isProductive: i.isProductive,
                seconds: rawSeconds,
              }
            : i;
        })
      )
    );
    updateTaskHistory();
    rawSeconds++;
  }
}, 1000);
