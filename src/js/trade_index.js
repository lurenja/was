$(function () {
  $('.date-input').datepicker({
    autoclose: true,
    format: 'yyyy-mm-dd'
  });
});

/* search data with ajax submit */
function searchData() {
  if (validForm()) {
    var data = $('#search-form').serialize();
    $.get('/get_history', data, function (result) {
      var table = $('#result-tb').find('tbody');
      table.empty(); // empty table data
      for (var i = 0, size = result.length; i < size; i++) {
        var $tr = $('<tr>');
        for (name in result[i]) {
          var $td = $('<td>');
          if (name == 'price' || name == 'sum') {
            $td.css('text-align', 'right');
            $td.text(formatFloat(result[i][name] + '', 3) + '');
          } else if (result[i][name] != null) {
            $td.text(result[i][name]);
          }
          $tr.append($td);
        }
        $(table).append($tr);
      }
      getSumm();
    }, 'json');
  }
}

/* prevent form input blank */
function validForm() {
  let isValid = true;
  let $inputs = $('#search-form').find('input[type="text"]');
  $inputs.each(function (index, elem) {
    if ($(this).val() == '') {
      $(this).css('border-color', 'red');
      isValid = false;
    } else {
      $(this).css('border-color', '');
    }
  });
  return isValid;
}

/* calulate the summary data */
function getSumm() {
  let inSum = 0, inAmount = 0, avgInPrice = 0, minInPrice = 0, suggestIn = 0;
  let outSum = 0, outAmount = 0, avgOutPrice = 0, maxOutPrice = 0, suggestOut = 0;
  let summTable = new Array();
  let $trs = $('#result-tb>tbody>tr'); //find all trs in table

  $trs.each(function (index, elem) {
    let $tds = $(elem).find('td');
    let currPrice = parseFloat($tds.eq(5).text());
    if ($tds.eq(4).text() == '证券买入') {
      inAmount += parseInt($tds.eq(6).text()); // add total amount
      inSum += parseFloat($tds.eq(7).text()); // add total cost
      if (minInPrice == 0 || minInPrice > currPrice) {
        minInPrice = currPrice;
      }
    } else if ($tds.eq(4).text() == '证券卖出') {
      outAmount += parseInt($tds.eq(6).text());
      outSum += parseFloat($tds.eq(7).text());
      if (maxOutPrice == 0 || maxOutPrice < currPrice) {
        maxOutPrice = currPrice;
      }
    }
  });

  let rate = 1.1;
  if (inAmount > 0) {
    avgInPrice = inSum / inAmount;
    suggestOut = avgInPrice > maxOutPrice ? avgInPrice : maxOutPrice;
    suggestOut = suggestOut * 1.05;
  }

  if (outAmount > 0) {
    avgOutPrice = outSum / outAmount;
    suggestIn = avgOutPrice > minInPrice? minInPrice : avgOutPrice;
    suggestIn = suggestOut * 0.95;
  }
  summTable.push([avgInPrice.toFixed(3), maxOutPrice.toFixed(3), suggestOut.toFixed(3)]);
  summTable.push([avgOutPrice.toFixed(3), minInPrice.toFixed(3), suggestIn.toFixed(3)]);
  summTable.push([(outSum - inSum).toFixed(3)]);
  appendSumm(summTable);
}

/* append the summary table */
function appendSumm(summArray) {
  let $trs = $('#summary-tb').find('tr');
  for (x in summArray) {
    $tds = $trs.eq(x).find('td');
    for (y in summArray[x]) {
      $tds.eq(2 * y + 1).text(summArray[x][y]);
    }
  }
}