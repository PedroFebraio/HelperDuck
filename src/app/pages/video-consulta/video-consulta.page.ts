import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultaServices } from 'src/app/services/consulta';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-video-consulta',
  templateUrl: './video-consulta.page.html',
  styleUrls: ['./video-consulta.page.scss'],
  standalone: false
})
export class VideoConsultaPage implements OnInit, AfterViewInit {

  consultaId = '';
  consulta: any;
  carregando = true;
  tipoUsuario: 'usuario' | 'psicologo' = 'usuario';
  presencaConfirmada = false;

  @ViewChild('localVideo', { static: false })
  localVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild('remoteVideo', { static: false })
  remoteVideo?: ElementRef<HTMLVideoElement>;

  localStream?: MediaStream;
  remoteStream?: MediaStream;
  chamadaIniciada = false;
  peerConnection!: RTCPeerConnection;
  isPsicologo = false;  

  iceOferta: any[] = [];
  iceResposta: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private consultaService: ConsultaServices
  ) {}


  ngAfterViewInit(){

  }


  async ngOnInit() {

    this.consultaId =
      this.route.snapshot.paramMap.get('id') || '';

    const usuario =
      localStorage.getItem('usuario');

    const psicologo =
      localStorage.getItem('psicologo');

    await this.solicitarPermissoes();

    if(usuario){

      this.tipoUsuario = 'usuario';
      this.isPsicologo = false;

    }else if(psicologo){

      this.tipoUsuario = 'psicologo';
      this.isPsicologo = true;

    }

    this.escutarConsulta();
  }



  escutarConsulta(){

    this.consultaService
      .escutarConsulta(this.consultaId)
      .subscribe(async (consulta: any) => {

        this.consulta = consulta;

        if(
          consulta.offer &&
          !consulta.answer &&
          !this.isPsicologo &&
          this.peerConnection
        ){

          await this.criarAnswer(
            consulta.offer
          );
        }

        if(
          consulta.answer &&
          this.isPsicologo &&
          this.peerConnection &&
          !this.peerConnection.currentRemoteDescription
        ){

          this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(
              consulta.answer
            )
          );

          console.log(
            'Answer recebida'
          );
        }

        if(
          consulta.iceCandidatesOferta &&
          !this.isPsicologo &&
          this.peerConnection
        ){

          for(
            const candidato
            of consulta.iceCandidatesOferta
          ){

            try{

              await this.peerConnection
                .addIceCandidate(
                  new RTCIceCandidate(
                    candidato
                  )
                );

            }catch{}
          }
        }

        if(
          consulta.iceCandidatesResposta &&
          this.isPsicologo &&
          this.peerConnection
        ){

          for(
            const candidato
            of consulta.iceCandidatesResposta
          ){

            try{

              await this.peerConnection
                .addIceCandidate(
                  new RTCIceCandidate(
                    candidato
                  )
                );

            }catch{}
          }
        }

        this.presencaConfirmada =

          this.tipoUsuario === 'usuario'
          ? consulta.checkinUsuario
          : consulta.checkinPsicologo;

        this.carregando = false;

      });
  }



  async confirmarPresenca(){

    let dados: any = {};

    if(this.tipoUsuario === 'usuario'){

      dados = {

        checkinUsuario: true,

        horaEntradaUsuario:
          new Date().toISOString()
      };

    }else{

      dados = {

        checkinPsicologo: true,

        horaEntradaPsicologo:
          new Date().toISOString()
      };
    }

    const sucesso =
      await this.consultaService
        .atualizarConsulta(
          this.consultaId,
          dados
        );

    if(sucesso){

      this.presencaConfirmada = true;

    }
  }


  async iniciarCamera(){

    try{

      this.localStream =
        await navigator.mediaDevices.getUserMedia({

          video: true,

          audio: true
        });

        if(this.localVideo){

          this.localVideo.nativeElement.srcObject =
          this.localStream;

        }

      }catch(error){

      console.log(
        'Erro ao acessar câmera:',
        error
      );
    }
  }



  get consultaLiberada(){

    return this.consulta?.checkinUsuario &&
           this.consulta?.checkinPsicologo;
  }



  async entrarNaSala() {

    if(this.chamadaIniciada){
      return;
    }

    try{

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: true

        });

      this.localStream = stream;

      if(this.localVideo?.nativeElement){

        this.localVideo.nativeElement.srcObject =
          stream;
      }

      this.criarPeerConnection();

      stream.getTracks().forEach(track => {

        this.peerConnection?.addTrack(
          track,
          stream
        );

      });

      console.log(
        'Sala iniciada:',
        this.consultaId
      );

      this.chamadaIniciada = true;

      if(this.isPsicologo){

        await this.criarOffer();

      }

    }catch(error){

      console.log(
        'Erro ao abrir câmera:',
        error
      );
    }
  }



  async sairDaConsulta() {

    if(this.localStream){

      this.localStream
        .getTracks()
        .forEach(track => {

          track.stop();

        });
    }

    if(this.peerConnection){

      this.peerConnection.close();
    }

    if(this.localVideo?.nativeElement){

      this.localVideo.nativeElement.srcObject =
        null;
    }

    if(this.remoteVideo?.nativeElement){

      this.remoteVideo.nativeElement.srcObject =
        null;
    }

    this.chamadaIniciada = false;

    await this.consultaService.atualizarConsulta(
      this.consultaId,
      {
        offer: null,
        answer: null,
        iceCandidatesOferta: [],
        iceCandidatesResposta: []
      }
    );
  }



  async solicitarPermissoes() {

    try {

      await Camera.requestPermissions();

    } catch(error) {
      console.log(error);
    }
  }

  
  
  criarPeerConnection(){

    const configuration = {

      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    };

    this.peerConnection =
      new RTCPeerConnection(configuration);

    this.peerConnection.ontrack = (event) => {

      if(
        this.remoteVideo?.nativeElement
      ){

        this.remoteVideo.nativeElement.srcObject =
          event.streams[0];
      }
    };

    this.peerConnection.onconnectionstatechange =
      () => {

        console.log(
          'Estado:',
          this.peerConnection.connectionState
        );
      };

    this.peerConnection.onicecandidate = async (event) => {

      if(!event.candidate){
        return;
      }

      const candidato =
        event.candidate.toJSON();

      if(this.isPsicologo){

        this.iceOferta.push(
          candidato
        );

        await this.consultaService
          .salvarIceOferta(
            this.consultaId,
            this.iceOferta
          );

      }else{

        this.iceResposta.push(
          candidato
        );

        await this.consultaService
          .salvarIceResposta(
            this.consultaId,
            this.iceResposta
          );
      }
    };
  }
    



  async criarOffer(){

    const offer =
      await this.peerConnection.createOffer();

    await this.peerConnection.setLocalDescription(
      offer
    );

    await this.consultaService.salvarOffer(
      this.consultaId,
      offer
    );

    console.log(
      'Offer enviada'
    );
  }



  async criarAnswer(offer: any){

    if(
      !this.peerConnection.currentRemoteDescription
    ){
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
    }

    const answer =
      await this.peerConnection.createAnswer();

    await this.peerConnection.setLocalDescription(
      answer
    );

    await this.consultaService.salvarAnswer(
      this.consultaId,
      answer
    );

    console.log(
      'Answer enviada'
    );
  }
}