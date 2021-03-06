import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserService } from '../services/user.service';
import * as _ from 'lodash';
import { LoadingDialogComponent } from '../app-dialogs/loading-dialog/loading-dialog.component';
import { config } from '../settings';
import { countries } from '../app-assets/countries/fr';
import {Observable} from 'rxjs/index';
import  commons from '../app-assets/communes/fr.json';
import {map, startWith} from 'rxjs/operators';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class RegisterComponent implements OnInit {
  userForm: FormGroup;
  boats: FormArray = new FormArray([]);
  status: string = '';
  isSubmit: boolean;
  config = config;
  countries = countries;
  keys = Object.keys(countries);
  commons: any[] = commons;
  commonCtrl = new FormControl();
  filteredCommons: Observable<any[]>;
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.filteredCommons = this.commonCtrl.valueChanges
      .pipe(startWith(''),
        map(common => common ? this._filterCommons(common).slice(0, 5) : this.commons.slice(0, 5))
      );
  }
  private _filterCommons(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.commons.filter(common => common["nom_complet"].toLowerCase().indexOf(filterValue) === 0);
  }
  // component initialisation
  ngOnInit() {

    this.userForm = this.fb.group({
      category: new FormControl('particulier', Validators.required),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      website: new FormControl(''),
      company: new FormControl(''),
      email: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      zip: new FormControl(''),
      common: new FormControl(''),
      city: new FormControl('null'),
      country: new FormControl('FR', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      repeat: new FormControl('', [Validators.required, Validators.minLength(6)]),
      boats: this.fb.array([])
    }, { validator: this.passwordConfirming, updateOn: 'blur' });
  }
  // Confirm password validation
  passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password').value !== c.get('repeat').value) {
      return { invalid: true };
    }
  }
  // add new Boat
  addBoat() {
    this.boats = this.userForm.get('boats') as FormArray;
    let fg: FormGroup = this.fb.group({
      name: new FormControl('', Validators.required),
      matriculation: new FormControl('', Validators.required),
    });
    this.boats.push(fg);
  }

  // remove Boat
  removeBoat(indice: any) {
    this.boats.removeAt(indice);
  }

  // save User
  save() {
    this.isSubmit = true;
    if (this.userForm.invalid) {
      this.snackBar.open("Merci de remplir les champs correctement", "OK", {
        duration: 3000
      });
    } else {
      const data: any = this.userForm.getRawValue();
      data.common = this.commonCtrl.value;
      delete data.repeat;
      data.boats = _.filter(data.boats, boat => {
        if (_.get(boat, 'name') && _.get(boat, 'matriculation'))
          return boat;
      });
      let dialogRef = this.dialog.open(LoadingDialogComponent, {
        disableClose: true
      });

      console.log(data);
      this.userService.post(data)
        .then(user => {
          setTimeout(() => {
            dialogRef.close();
            this.status = 'complete';
          }, 500);
        }, error => {
          if (_.get(error, 'error.error.name') == 'invalid_model')
            this.snackBar.open("Cet email existe déjà", "OK", {
              duration: 5000
            });
          setTimeout(() => {
            dialogRef.close();
          }, 500);
        });
    }
  }

  // User getters
  get email() { return this.userForm.get('email'); }
  get phone() { return this.userForm.get('phone'); }
  get lastname() { return this.userForm.get('lastname'); }
  get firstname() { return this.userForm.get('firstname'); }
  get country() { return this.userForm.get('country'); }
  get common() { return this.userForm.get('common'); }
  get city() { return this.userForm.get('city'); }
  get company() { return this.userForm.get('company'); }
  get address() { return this.userForm.get('address'); }
  get category() { return this.userForm.get('category'); }
  get website() { return this.userForm.get('website'); }
  get password() { return this.userForm.get('password'); }
  get repeat() { return this.userForm.get('repeat'); }

  // Boat Getters
  get name() { return this.userForm.get('boats').get('name'); }
  get matriculation() { return this.userForm.get('boats').get('matriculation'); }

}

