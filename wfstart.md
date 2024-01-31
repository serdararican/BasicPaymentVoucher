``` abap
  
  METHOD bankingwfstartse_create_entity.
    DATA: ls_entityset         TYPE zcl_zfi_bank_pymt_vou_mpc=>ts_bankingwfstart,
          ls_empinfo           TYPE zfis_bank_pv,
          lv_refno             TYPE char14,
          lv_subrc             TYPE subrc,
          lv_msg_refno         TYPE bapi_msg,
          lv_bapi_text         TYPE bapi_msg,
          lo_message_container TYPE REF TO /iwbep/if_message_container.
    DATA:    lt_bapiret TYPE bapiret2_t.
    TYPES:
      BEGIN OF ts_releaser,
*        id    TYPE i,
        kid   TYPE umnam,
        count TYPE numc1,
      END OF ts_releaser.
    DATA: lt_kid  TYPE  TABLE OF ts_releaser,
          ls_kid2 TYPE ts_releaser,
          ls_kid  TYPE ts_releaser.

    io_data_provider->read_entry_data( IMPORTING es_data = ls_entityset ).
    ls_empinfo = ls_entityset-esbankinginfo.
    ls_empinfo-created_by =  to_upper( ls_empinfo-created_by ).

    lo_message_container = mo_context->get_message_container( ).

    zcl_zfi_bank_pv_utilities=>bank_check_am01(
      EXPORTING
        is_emp_info = ls_empinfo             " Structure for user display
      IMPORTING
        ev_bapi_msg = lv_bapi_text          " Message Text
        ev_subrc    = lv_subrc               " ABAP System Field: Return Code of ABAP Statements
    ).

    IF lv_subrc IS NOT INITIAL.
      lo_message_container->add_message(
        EXPORTING
          iv_msg_type               = 'E'
          iv_msg_id                 = 'SY'
          iv_msg_number             = '403'
          iv_msg_text               = lv_bapi_text
      ).
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          message_container = lo_message_container.
    ENDIF.

    zcl_zfi_bank_pv_utilities=>bank_pv_wf_start(
      EXPORTING
        iv_prio     = ls_entityset-iv_prio                  " Priority of a Work Item
        is_emp_info = ls_empinfo                            " Structure for user display
      IMPORTING
        ev_refno    = lv_refno                              " Text field length 14
        ev_subrc    = lv_subrc                              " Subroutines for return code
        et_bapiret  = lt_bapiret                 " Table with BAPI Return Information
    ).
    IF lv_subrc IS NOT INITIAL.
      IF lv_subrc EQ 7.
        lo_message_container->add_messages_from_bapi(
          EXPORTING
            it_bapi_messages          =  lt_bapiret                " Return parameter table
        ).
      ENDIF.
      RAISE EXCEPTION TYPE /iwbep/cx_mgw_busi_exception
        EXPORTING
          message_container = lo_message_container.
    ENDIF.

    me->refno = lv_refno .
    lv_msg_refno = lv_refno .

    lo_message_container->add_message(
    EXPORTING
    iv_msg_id = 'BL'
    iv_msg_number = '001'
    iv_msg_type = 'S'
    iv_msg_text = lv_msg_refno
    iv_is_leading_message = abap_true
    iv_add_to_response_header = abap_true
    ).

    er_entity = VALUE #( esbankinginfo = ls_empinfo ).
  ENDMETHOD.
```
