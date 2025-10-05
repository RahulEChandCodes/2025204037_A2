// Every line of code in the file was written by hand!
["click", "route"].forEach((eType) => {
  window.addEventListener(eType, (event) => {
    console.log({
      Timestamp_of_event: event.timeStamp,
      type_of_event: event.type,
      event_Object: event.target,
    });
  });
});
