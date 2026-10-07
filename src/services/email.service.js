import nodemailer from 'nodemailer';

import env from '../config/env.config.js';
import HttpError from '../utils/http-error.js';

class EmailService {
    constructor() {
        this.transporter = null;
    }

    getTransporter() {
        if (!env.mailHost || !env.mailPort || !env.mailUser || !env.mailPass || !env.mailFrom) {
            throw new HttpError('El servicio de email no está configurado', 500);
        }
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: env.mailHost,
                port: env.mailPort,
                secure: env.mailPort === 465,
                connectionTimeout: 10_000,
                greetingTimeout: 10_000,
                socketTimeout: 10_000,
                auth: { user: env.mailUser, pass: env.mailPass },
            });
        }
        return this.transporter;
    }

    async sendTicketConfirmation({ to, event, ticket }) {
        await this.getTransporter().sendMail({
            from: env.mailFrom,
            to,
            subject: `Inscripción confirmada: ${event.title}`,
            text: [
                `Tu inscripción a ${event.title} fue confirmada.`,
                `Código de reserva: ${ticket.reservationCode}`,
                `Cantidad: ${ticket.quantity}`,
                `Fecha: ${new Date(event.date).toLocaleString('es-MX')}`,
                `Lugar: ${event.location}`,
            ].join('\n'),
        });
    }

    async sendTicketCancellation({ to, event, ticket }) {
        if (!to || !event?.title) {
            throw new HttpError('Faltan datos para notificar la cancelación', 500);
        }
        await this.getTransporter().sendMail({
            from: env.mailFrom,
            to,
            subject: `Inscripción cancelada: ${event.title}`,
            text: [
                `Tu inscripción a ${event.title} fue cancelada.`,
                `Código de reserva: ${ticket.reservationCode}`,
                `Cantidad: ${ticket.quantity}`,
                `Fecha: ${new Date(event.date).toLocaleString('es-MX')}`,
                `Lugar: ${event.location}`,
            ].join('\n'),
        });
    }
}

export default new EmailService();
